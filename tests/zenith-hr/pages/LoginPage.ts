// ============================================================================
// LoginPage.ts — a CLASS (a Page Object) for the Zenith HR login screen.
// This file is where we explain the OOP concepts: class, constructor, this.
// ============================================================================

import { expect, type Page, type Locator } from '@playwright/test';
import { log } from '../utils/logger';

// the login path is RELATIVE — the base URL comes from the config (multi-env),
// so the same test runs against dev / staging / prod via TEST_ENV.
const LOGIN_PATH = '/web/index.php/auth/login';

// 🔷 CLASS = a BLUEPRINT for making objects.
//    "class LoginPage" describes what every LoginPage object HAS (properties)
//    and what it can DO (methods). It's a template; nothing runs until someone
//    writes `new LoginPage(page)` in a test.
export class LoginPage {

  // 🔷 PROPERTIES (also called fields) = variables that BELONG to the object.
  //    'readonly' = set once (in the constructor), never reassigned afterwards.
  //    Every LoginPage object will carry its own copy of these.
  readonly page: Page;         // the browser tab this page object drives
  readonly logo: Locator;
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;      // the red "Invalid credentials" banner
  readonly requiredErrors: Locator;  // the "Required" messages under empty fields

  // 🔷 CONSTRUCTOR = a special function that runs AUTOMATICALLY, one time,
  //    the moment someone does `new LoginPage(page)`. Its job: set up the
  //    object's properties. The `page` here is passed IN by the test.

  
  constructor(page: Page) {
    // 🔷 `this` = "THIS particular object being built right now".
    //    `this.page = page` means: store the incoming `page` onto this object,
    //    so every method below can use it later via `this.page`.
    this.page = page;

    // build each locator FROM this.page, and save it as a property.
    // (same locators as before — now they live on the object.)
    // use the image's ALT text — far more stable than a CSS class
    this.logo = page.getByAltText('company-branding');
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
  }

  // 🔷 METHOD = a function that BELONGS to the class. Inside it, `this` refers
  //    to the object it was called on. `await loginPage.open()` runs this.
  async open() {
    await this.page.goto(LOGIN_PATH);  // resolved against baseURL from the config
  }

  // a method with PARAMETERS (user, pass) = inputs the caller provides.
  async login(user: string, pass: string) {
    log.ui(`Login as "${user}"`);       // Winston — never log the password
    await this.username.fill(user);     // this.username = the locator we saved
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  // a reusable assertion method: "is the login page properly shown?"
  async expectLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.username).toBeVisible();
    await expect(this.username).toBeEditable();
    await expect(this.password).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }
}
