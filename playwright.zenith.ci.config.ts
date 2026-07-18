import { defineConfig } from '@playwright/test';
import base from './playwright.zenith.config';

// CI config for the Zenith HR tests. Reuses the local config (same testDir,
// projects, baseURL, globalSetup) and overrides only the CI-specific bits.
// Used by .github/workflows/zenith-ci.yml.
export default defineConfig({
  ...base,                                     // inherit everything from local
  retries: 2,                                  // CI: absorb flaky-demo noise
  workers: 1,                                  // 1 worker per shard, gentler on the demo
  reporter: [['list'], ['allure-playwright']], // each shard writes allure-results;
                                               // the report job merges + publishes them
});
