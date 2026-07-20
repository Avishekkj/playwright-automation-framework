// PAGE OBJECT for the PIM module page (Employee list) — opened from the sidebar.

import { expect, type Page, type Locator } from '@playwright/test';

export class PimPage {
  readonly page: Page;
  readonly sectionHeader: Locator;
  readonly employeeNameInput: Locator;
  readonly searchButton: Locator;
  readonly resultRows: Locator;
  readonly noRecords: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sectionHeader = page.getByText('Employee Information');
    // the "Employee Name" search box is an autocomplete ("Type for hints...")
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resultRows = page.locator('.oxd-table-card');
    // scoped to a <span> so it matches exactly one element (avoids the toast clash)
    this.noRecords = page.locator('span').filter({ hasText: 'No Records Found' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/pim/);
    await expect(this.sectionHeader).toBeVisible();
  }

  // search the employee list by name and submit
  async searchEmployee(name: string) {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
  }

  // assert a result row containing the given text is shown
  async expectEmployeeInResults(text: string) {
    await expect(this.resultRows.filter({ hasText: text }).first()).toBeVisible();
  }

  // open the profile of the result row that matches `text` (unique last name),
  // via its edit (pencil) button — NOT the first row, which may be someone else.
  async editEmployee(text: string) {
    const row = this.resultRows.filter({ hasText: text }).first();
    await row.locator('button:has(.bi-pencil-fill)').click();
  }

  // delete the result row that matches `text` (unique last name): click its trash
  // icon, confirm the dialog, and wait for the success toast.
  async deleteEmployee(text: string) {
    const row = this.resultRows.filter({ hasText: text }).first();
    await row.locator('button:has(.bi-trash)').click();
    const confirm = this.page.getByRole('button', { name: 'Yes, Delete' });
    await expect(confirm).toBeVisible();
    await confirm.click();
    await expect(this.page.getByText('Successfully Deleted')).toBeVisible();
  }
}
