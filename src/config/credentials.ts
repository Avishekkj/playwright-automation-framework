// ============================================================================
// Shared admin credentials for BOTH the API and UI suites — one source of truth.
// The password is read via secret(): it decrypts ADMIN_PASSWORD_ENC when set
// (encrypted secret in .env / GitHub secrets), else falls back to the public demo
// password. Username likewise from env or default. No plaintext password in code.
//
// Use `||` not `??` — an unset GitHub secret injects an EMPTY STRING in CI, and
// `??` would keep it; `||` correctly falls back.
// ============================================================================
import 'dotenv/config';
import { secret } from '../utils/crypto';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Admin';
export const ADMIN_PASSWORD = secret('ADMIN_PASSWORD') || 'admin123';
