// Zenith HR — NEGATIVE login tests. Proves the login FAILS correctly.
// Notice: we REUSE the same LoginPage page object — no new locators needed.

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Zenith HR - negative login', () => {
  let loginPage: LoginPage;   // shared across the tests below

  // beforeEach: open a fresh login page before EACH test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.expectLoaded();
  });

  // TC-02: wrong password -> "Invalid credentials" banner
  test('wrong password shows "Invalid credentials"', async () => {
    await loginPage.login('Admin', 'wrongpass');   // reuse the login action

    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toHaveText('Invalid credentials');
  });

  // TC-04: wrong username -> same banner
  test('wrong username shows "Invalid credentials"', async () => {
    await loginPage.login('NoSuchUser', 'admin123');

    await expect(loginPage.errorAlert).toHaveText('Invalid credentials');
  });

  // TC-03: empty fields -> "Required" validation under BOTH boxes
  test('empty fields show "Required" validation', async () => {
    // click Login without typing anything
    await loginPage.loginButton.click();

    // requiredErrors is a LIST locator — both username & password complain
    await expect(loginPage.requiredErrors).toHaveCount(2);
    await expect(loginPage.requiredErrors.first()).toHaveText('Required');
  });
});
