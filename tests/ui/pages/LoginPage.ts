// PAGE OBJECT MODEL (POM) — a class that represents ONE page.
// It holds the page's locators + actions, so tests read like plain English
// and selectors live in ONE place (change the UI -> fix here only).
// POM is to UI tests what the service clients (UsersApi) are to API tests.

import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // locators are defined ONCE here, named for humans
    this.username = page.locator('#user-name');
    this.password = page.locator('#password');
    this.loginButton = page.locator('#login-button');
  }

  async goto() {
    await this.page.goto('/'); // baseURL comes from the config
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
