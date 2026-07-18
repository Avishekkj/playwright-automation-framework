// Global setup — runs ONCE before the Zenith HR suite.
// It writes allure-results/environment.properties so the Allure report shows an
// "Environment" widget (which env + which URL the run targeted).

import { mkdirSync, writeFileSync } from 'fs';

const ENVS: Record<string, string> = {
  dev: 'https://opensource-demo.orangehrmlive.com',
  staging: 'https://opensource-demo.orangehrmlive.com',
  prod: 'https://opensource-demo.orangehrmlive.com',
};

export default async function globalSetup(): Promise<void> {
  const env = process.env.TEST_ENV ?? 'staging';
  const url = ENVS[env] ?? ENVS.staging;

  const properties = [
    `Environment=${env}`,
    `Base.URL=${url}`,
    `Browsers=chromium, firefox, webkit`,
  ].join('\n');

  mkdirSync('allure-results', { recursive: true });
  writeFileSync('allure-results/environment.properties', properties);
  console.log(`[global-setup] Allure environment => ${env} (${url})`);
}
