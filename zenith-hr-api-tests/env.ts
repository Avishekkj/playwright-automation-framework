// Environment config for the Zenith HR API suite (self-contained).
import 'dotenv/config';

const ENVS: Record<string, string> = {
  dev: 'https://opensource-demo.orangehrmlive.com',
  staging: 'https://opensource-demo.orangehrmlive.com',
  prod: 'https://opensource-demo.orangehrmlive.com',
};

export const TEST_ENV = process.env.TEST_ENV ?? 'staging';
export const BASE_URL = ENVS[TEST_ENV] ?? ENVS.staging;
export const AUTH_FILE = '.auth/zenith.json'; // saved session (gitignored)

// Admin credentials — shared with the UI suite (password decrypted via secret()).
export { ADMIN_USERNAME, ADMIN_PASSWORD } from '../src/config/credentials';
