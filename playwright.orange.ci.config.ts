import { defineConfig } from '@playwright/test';
import base from './playwright.orange.config';

// CI config for OrangeHRM tests. It REUSES the local config (same testDir,
// projects, timeouts, use) and overrides only the CI-specific bits.
// Used by .github/workflows/orange-ci.yml.
export default defineConfig({
  ...base,                    // inherit everything from the local config
  retries: 2,                 // CI: absorb flakiness from the slow external demo
  workers: 1,                 // 1 worker per shard = gentler on the demo
  reporter: [['blob']],       // each shard writes a blob; the merge job builds HTML
});
