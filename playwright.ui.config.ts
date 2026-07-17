import { defineConfig, devices } from '@playwright/test';

/**
 * SEPARATE config for UI tests (kept apart from the API config so neither
 * interferes with the other). Run it with:
 *    npx playwright test --config playwright.ui.config.ts
 *
 * Demonstrates:
 *   • browser PROJECTS (chromium here; add firefox/webkit the same way)
 *   • a 'setup' project that logs in once (dependency of the test project)
 *   • storageState — tests reuse the saved session, skipping login
 */
export default defineConfig({
  testDir: './tests/ui',
  timeout: 30_000,
  reporter: [['list']],

  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
  },

  projects: [
    // 1) SETUP — runs first, logs in, saves session to .auth/user.json
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // 2) the actual UI tests — depend on setup, and load the saved session
    {
      name: 'chromium',
      testMatch: /level-11\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json', // start already logged in
      },
      dependencies: ['setup'],
    },

    // To add more browsers, copy the block above with:
    //   { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
    //   { name: 'webkit',  use: { ...devices['Desktop Safari'],  storageState: '.auth/user.json' }, dependencies: ['setup'] },
    // (run `npx playwright install firefox webkit` first)
  ],
});
