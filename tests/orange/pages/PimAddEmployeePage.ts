// PAGE OBJECT for PIM → Add Employee.

import { expect, type Page, type Locator } from '@playwright/test';

export class PimAddEmployeePage {
  readonly page: Page;
  readonly addEmployeeLink: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly employeeId: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addEmployeeLink = page.getByRole('link', { name: 'Add Employee' });
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    // OrangeHRM auto-fills this; we override it with a unique value to avoid
    // "Employee Id already exists" on the shared demo.
    this.employeeId = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Employee Id' })
      .getByRole('textbox');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  // open the Add Employee form (from anywhere inside PIM)
  async open() {
    await this.addEmployeeLink.click();
    await expect(this.firstName).toBeVisible();
  }

  // fill the form + save; on success OrangeHRM navigates to Personal Details
  async addEmployee(first: string, last: string, employeeId?: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    if (employeeId) {
      await this.employeeId.fill(employeeId); // fill() overwrites the auto value
    }
    await this.saveButton.click();
    await expect(this.page).toHaveURL(/viewPersonalDetails/);
  }
}
