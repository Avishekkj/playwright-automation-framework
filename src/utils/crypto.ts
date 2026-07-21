// ============================================================================
// crypto.ts — simple, enterprise-standard encryption for secrets.
//
// Uses Node's BUILT-IN `crypto` (no dependency) with AES-256-GCM — the modern
// enterprise default. GCM is "authenticated" encryption: it also detects if the
// ciphertext was tampered with, so a bad/edited value fails loudly on decrypt.
//
// The point in a test framework: keep passwords OUT of plaintext config. You
// encrypt a password once (via the CLI below), store the encrypted string in
// .env, and the tests decrypt it at runtime. Only someone with CRYPTO_SECRET
// can read it.
//
//   Encrypt a value:   npx tsx src/utils/crypto.ts encrypt "admin123"
//   Decrypt it back:   npx tsx src/utils/crypto.ts decrypt "<the:encrypted:string>"
// ============================================================================
import crypto from 'crypto';
import 'dotenv/config';

const ALGO = 'aes-256-gcm';

// The master secret comes from the environment (.env locally, a GitHub secret in
// CI) — NEVER hardcoded. Resolved LAZILY (only when we actually encrypt/decrypt)
// so importing this module never crashes a run that isn't using encryption.
function getKey(): Buffer {
  const secretKey = process.env.CRYPTO_SECRET ?? '';
  if (!secretKey) {
    throw new Error(
      'CRYPTO_SECRET is not set. Add it to .env (any strong passphrase) — it is the ' +
        'key used to encrypt/decrypt secrets. Keep it out of source control.',
    );
  }
  // scrypt stretches the passphrase into a proper 32-byte (256-bit) key
  return crypto.scryptSync(secretKey, 'zenith-hr-salt', 32);
}

/** Encrypt a plaintext string → "iv:authTag:ciphertext" (all base64). */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV, recommended for GCM
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag(); // integrity check produced by GCM
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

/** Decrypt a value produced by encrypt(). Throws if the key is wrong or it was tampered with. */
export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted value — expected "iv:authTag:ciphertext".');
  }
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Read a secret from the environment, transparently decrypting it if it's stored
 * encrypted. Convention: PASSWORD holds plaintext, PASSWORD_ENC holds the
 * encrypted form. Prefer the encrypted one when present.
 *   secret('ADMIN_PASSWORD')  ->  reads ADMIN_PASSWORD_ENC (decrypt) else ADMIN_PASSWORD
 */
export function secret(name: string): string {
  const encrypted = process.env[`${name}_ENC`];
  if (encrypted) return decrypt(encrypted);
  return process.env[name] ?? '';
}

// --- tiny CLI -------------------------------------------------------------
// Runs only when this file is executed directly (not when imported by a test).
const runDirectly = !!process.argv[1] && /crypto\.(ts|js)$/.test(process.argv[1]);
if (runDirectly) {
  const [cmd, value] = process.argv.slice(2);
  if ((cmd !== 'encrypt' && cmd !== 'decrypt') || !value) {
    console.log('Usage:\n  npx tsx src/utils/crypto.ts encrypt "your-secret"\n  npx tsx src/utils/crypto.ts decrypt "iv:tag:ciphertext"');
    process.exit(1);
  }
  console.log(cmd === 'encrypt' ? encrypt(value) : decrypt(value));
}
