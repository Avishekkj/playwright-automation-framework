// AUTH SETUP — runs ONCE (as its own project) before the UI tests.
// It logs in through the UI, then SAVES the session (cookies + storage) to a
// file. The real tests then LOAD that file and start already logged in,
// so they never repeat the slow login flow.

import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const AUTH_FILE = '.auth/user.json';

setup('log in once and save session', async ({ page }) => {
  const login = new LoginPage(page);   // use the Page Object
  await login.goto();
  await login.login('standard_user', 'secret_sauce');

  // wait until login actually succeeded (URL changed to the products page)
  await page.waitForURL('**/inventory.html');

  // SAVE cookies + localStorage to a file for the tests to reuse
  await page.context().storageState({ path: AUTH_FILE });
});
