import { defineConfig } from '@playwright/test';

// A simple, standalone config just for our OrangeHRM learning tests.
// Run it with:  npx playwright test --config playwright.orange.config.ts
export default defineConfig({
  testDir: './tests/orange',
  timeout: 60_000,               // OrangeHRM's demo can be a bit slow
  expect: { timeout: 10_000 },   // give assertions more time on the slow demo
  // In CI each shard writes a 'blob' report; the merge job combines them into
  // one HTML report. Locally we keep the friendly 'list' output.
  reporter: process.env.CI ? [['blob']] : [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
