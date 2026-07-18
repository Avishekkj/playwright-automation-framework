import { defineConfig, devices } from '@playwright/test';

// LOCAL config for OrangeHRM tests. CI uses playwright.orange.ci.config.ts.
// Run:  npx playwright test --config playwright.orange.config.ts --project=chromium
export default defineConfig({
  testDir: './tests/orange',
  timeout: 60_000,               // OrangeHRM's demo can be a bit slow
  expect: { timeout: 15_000 },
  retries: 1,                    // retry once locally — absorbs the flaky demo
                                 // (a test that only passes on retry is marked
                                 //  "flaky" in the output, so you still see it)

  // LOCAL reporters: terminal 'list' + Playwright 'html' + 'allure' results.
  //  - Playwright HTML: npx playwright show-report
  //  - Allure: writes raw results to allure-results/, then:
  //      npx allure generate allure-results --clean -o allure-report
  //      npx allure open allure-report
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],

  use: {
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
