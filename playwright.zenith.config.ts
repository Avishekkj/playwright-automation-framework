import { defineConfig, devices } from '@playwright/test';

// LOCAL config for the Zenith HR UI tests. CI uses playwright.zenith.ci.config.ts.
// Run:  TEST_ENV=staging npx playwright test --config playwright.zenith.config.ts --project=chromium

// ── MULTI-ENVIRONMENT ────────────────────────────────────────────────────────
// Pick the base URL by TEST_ENV. (All three point to the same demo for now —
// this shows the capability; swap the URLs when real envs exist.)
const ENVS: Record<string, string> = {
  dev: 'https://opensource-demo.orangehrmlive.com',
  staging: 'https://opensource-demo.orangehrmlive.com',
  prod: 'https://opensource-demo.orangehrmlive.com',
};
export const TEST_ENV = process.env.TEST_ENV ?? 'staging';
export const BASE_URL = ENVS[TEST_ENV] ?? ENVS.staging;

export default defineConfig({
  testDir: './tests/zenith-hr',
  globalSetup: './tests/zenith-hr/global-setup.ts', // writes Allure environment.properties
  timeout: 60_000,               // the demo can be a bit slow
  expect: { timeout: 15_000 },
  retries: 1,                    // retry once locally — absorbs flaky-demo noise

  // LOCAL reporters: terminal 'list' + Playwright 'html' + 'allure' results.
  //   Allure: npx allure generate allure-results --clean -o allure-report && npx allure open allure-report
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],

  use: {
    baseURL: BASE_URL,           // page objects navigate relative to this
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Browser targets — pick one with --project=chromium | firefox | webkit
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
