import { defineConfig } from '@playwright/test';

// A simple, standalone config just for our OrangeHRM learning tests.
// Run it with:  npx playwright test --config playwright.orange.config.ts
export default defineConfig({
  testDir: './tests/orange',
  timeout: 60_000,               // OrangeHRM's demo can be a bit slow
  expect: { timeout: 15_000 },   // give assertions more time on the slow demo
  // CI safety net for the flaky external demo site:
  retries: process.env.CI ? 2 : 0,          // re-run a failed test up to 2x in CI
  workers: process.env.CI ? 1 : undefined,  // 1 worker/shard = gentler on the slow site
                                            // (cross-shard parallelism still applies)
  // In CI each shard writes a 'blob' report; the merge job combines them into
  // one HTML report. Locally we keep the friendly 'list' output.
  reporter: process.env.CI ? [['blob']] : [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
