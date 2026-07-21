// PAGE OBJECT for Admin → Add User (turn an employee into a system user / admin).
// This page has the tricky Zenith HR widgets: custom dropdowns + an autocomplete.

import { expect, type Page, type Locator } from '@playwright/test';

export interface NewUser {
  role: string;          // 'Admin' | 'ESS'
  employeeName: string;  // full name of an existing employee
  status: string;        // 'Enabled' | 'Disabled'
  username: string;
  password: string;
}

export class AdminAddUserPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInputs: Locator;   // password + confirm (both type=password)
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.usernameInput = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Username' })
      .getByRole('textbox');
    this.passwordInputs = page.locator('input[type="password"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  // from the System Users page, open the Add User form
  async open() {
    await this.addButton.click();
    await expect(this.page).toHaveURL(/saveSystemUser/);
  }

  // helper: pick a value from an Zenith HR CUSTOM dropdown (not a native <select>)
  private async selectDropdown(labelText: string, optionText: string) {
    const group = this.page.locator('.oxd-input-group').filter({ hasText: labelText });
    await group.locator('.oxd-select-text').click();          // open it
    await this.page.getByRole('option', { name: optionText }).click(); // pick option
  }

  // helper: fill the employee AUTOCOMPLETE and pick the option that MATCHES the
  // name (waiting past the "Searching..." state — matching by name skips it).
  private async pickEmployee(name: string) {
    const input = this.page.getByPlaceholder('Type for hints...');
    await input.fill(name);
    await this.page.getByRole('option', { name }).click();
  }

  async createUser(u: NewUser) {
    await this.selectDropdown('User Role', u.role);
    await this.pickEmployee(u.employeeName);
    await this.selectDropdown('Status', u.status);
    await this.usernameInput.fill(u.username);
    await this.passwordInputs.nth(0).fill(u.password);        // Password
    await this.passwordInputs.nth(1).fill(u.password);        // Confirm Password
    await this.saveButton.click();
    await expect(this.page).toHaveURL(/viewSystemUsers/);     // back to the list
  }

  // on the EDIT user form: change the Status ('Enabled' | 'Disabled') and save.
  async updateStatus(status: string) {
    await this.selectDropdown('Status', status);
    await this.saveButton.click();
    await expect(this.page).toHaveURL(/viewSystemUsers/);     // back to the list
  }
}
