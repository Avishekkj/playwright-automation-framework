import { defineConfig } from '@playwright/test';
import { BASE_URL } from './zenith-hr-api-tests/env';

// Config for the Zenith HR API suite (top-level zenith-hr-api-tests/).
//   'setup' -> logs in via API, saves .auth/zenith.json (runs first)
//   'api'   -> the API tests, reuse that session (depends on setup)
// Run all:        npx playwright test --config playwright.zenith-api.config.ts
// Run login only: npx playwright test --config playwright.zenith-api.config.ts --project=setup
export default defineConfig({
  testDir: './zenith-hr-api-tests',
  timeout: 30_000,
  reporter: [['list'], ['allure-playwright']],
  use: { baseURL: BASE_URL },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'api', testMatch: /.*\.spec\.ts$/, dependencies: ['setup'] },
  ],
});
