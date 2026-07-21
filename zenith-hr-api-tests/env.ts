// Environment config for the Zenith HR API suite (self-contained).
import 'dotenv/config';
import { secret } from '../src/utils/crypto';

const ENVS: Record<string, string> = {
  dev: 'https://opensource-demo.orangehrmlive.com',
  staging: 'https://opensource-demo.orangehrmlive.com',
  prod: 'https://opensource-demo.orangehrmlive.com',
};

export const TEST_ENV = process.env.TEST_ENV ?? 'staging';
export const BASE_URL = ENVS[TEST_ENV] ?? ENVS.staging;
export const AUTH_FILE = '.auth/zenith.json'; // saved session (gitignored)

// Admin credentials. The password is read via secret() — it decrypts
// ADMIN_PASSWORD_ENC when present (encrypted secret in .env / GitHub secrets),
// otherwise falls back to the public demo password. No plaintext in source.
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'Admin';
export const ADMIN_PASSWORD = secret('ADMIN_PASSWORD') || 'admin123';
