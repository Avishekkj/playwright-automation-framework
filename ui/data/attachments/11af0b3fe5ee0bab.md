# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-negative.spec.ts >> Zenith HR - negative login >> wrong password shows "Invalid credentials"
- Location: tests/zenith-hr/login-negative.spec.ts:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.oxd-alert-content-text')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('.oxd-alert-content-text')
    - waiting for" https://opensource-demo.orangehrmlive.com/web/index.php/auth/validate" navigation to finish...
    - navigated to "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"

```

```yaml
- img "company-branding"
- heading "Login" [level=5]
- paragraph: "Username : Admin"
- paragraph: "Password : admin123"
- text:  Username
- textbox "Username": Admin
- text:  Password
- textbox "Password": wrongpass
- button "Login"
- paragraph: Forgot your password?
- link:
  - /url: https://www.linkedin.com/company/orangehrm/mycompany/
- link:
  - /url: https://www.facebook.com/OrangeHRM/
- link:
  - /url: https://twitter.com/orangehrm?lang=en
- link:
  - /url: https://www.youtube.com/c/OrangeHRMInc
- paragraph: OrangeHRM OS 5.9
- paragraph:
  - text: © 2005 - 2026
  - link "OrangeHRM, Inc":
    - /url: http://www.orangehrm.com
  - text: . All rights reserved.
- img "orangehrm-logo"
```

# Test source

```ts
  1  | // Zenith HR — NEGATIVE login tests. Proves the login FAILS correctly.
  2  | // Notice: we REUSE the same LoginPage page object — no new locators needed.
  3  | 
  4  | import { test, expect } from '@playwright/test';
  5  | import { LoginPage } from './pages/LoginPage';
  6  | 
  7  | test.describe('Zenith HR - negative login', () => {
  8  |   let loginPage: LoginPage;   // shared across the tests below
  9  | 
  10 |   // beforeEach: open a fresh login page before EACH test
  11 |   test.beforeEach(async ({ page }) => {
  12 |     loginPage = new LoginPage(page);
  13 |     await loginPage.open();
  14 |     await loginPage.expectLoaded();
  15 |   });
  16 | 
  17 |   // TC-02: wrong password -> "Invalid credentials" banner
  18 |   test('wrong password shows "Invalid credentials"', async () => {
  19 |     await loginPage.login('Admin', 'wrongpass');   // reuse the login action
  20 | 
> 21 |     await expect(loginPage.errorAlert).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  22 |     await expect(loginPage.errorAlert).toHaveText('Invalid credentials');
  23 |   });
  24 | 
  25 |   // TC-04: wrong username -> same banner
  26 |   test('wrong username shows "Invalid credentials"', async () => {
  27 |     await loginPage.login('NoSuchUser', 'admin123');
  28 | 
  29 |     await expect(loginPage.errorAlert).toHaveText('Invalid credentials');
  30 |   });
  31 | 
  32 |   // TC-03: empty fields -> "Required" validation under BOTH boxes
  33 |   test('empty fields show "Required" validation', async () => {
  34 |     // click Login without typing anything
  35 |     await loginPage.loginButton.click();
  36 | 
  37 |     // requiredErrors is a LIST locator — both username & password complain
  38 |     await expect(loginPage.requiredErrors).toHaveCount(2);
  39 |     await expect(loginPage.requiredErrors.first()).toHaveText('Required');
  40 |   });
  41 | });
  42 | 
```