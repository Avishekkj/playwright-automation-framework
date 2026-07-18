import { defineConfig, devices } from '@playwright/test';

// Dedicated config for the "browser concepts" lessons.
// Single CHROMIUM project — iPhone/isMobile emulation is chromium-only, and
// these demos only need one browser.
// Run:  npx playwright test --config playwright.lessons.config.ts
export default defineConfig({
  testDir: './tests/lessons',
  timeout: 30_000,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
