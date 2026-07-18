import { defineConfig } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Enterprise API automation config.
 * - baseURL + auth header are injected once here, never in individual tests.
 * - Three reporters: console (list), HTML (visual), JUnit (CI ingestion).
 * - Retries + parallel workers switch on automatically in CI.
 */
export default defineConfig({
  testDir: './tests',
  // keep the Zenith HR UI + web-concepts tests out of the API run (own configs)
  testIgnore: ['tests/ui/**', 'tests/zenith-hr/**', 'tests/web/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'results/junit.xml' }],
    ['allure-playwright'],
  ],

  use: {
    baseURL: env.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Token injected globally so tests never carry secrets.
      Authorization: `Bearer ${env.token}`,
    },
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'api' },
  ],
});
