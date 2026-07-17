import 'dotenv/config';

/**
 * Central config. Reads from environment (.env locally, secrets in CI).
 * Secrets NEVER live in source — only here, sourced from the environment.
 */
const rawBase = process.env.GOREST_BASE_URL ?? 'https://gorest.co.in/public/v2';

export const env = {
  // MUST end with '/' so relative paths append instead of resolving from host root.
  baseUrl: rawBase.endsWith('/') ? rawBase : `${rawBase}/`,
  token: process.env.GOREST_TOKEN ?? '',
  dummyBaseUrl: process.env.DUMMY_BASE_URL ?? 'https://dummyjson.com',
} as const;

/** Fail fast with a helpful message when a token-dependent test runs without one. */
export function requireToken(): string {
  if (!env.token) {
    throw new Error(
      'GOREST_TOKEN is not set. Copy .env.example to .env and add your token ' +
        'from https://gorest.co.in/consumer/login',
    );
  }
  return env.token;
}
