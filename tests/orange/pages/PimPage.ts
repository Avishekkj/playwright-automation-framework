// PAGE OBJECT for the PIM module page (Employee list) — opened from the sidebar.

import { expect, type Page, type Locator } from '@playwright/test';

export class PimPage {
  readonly page: Page;
  readonly sectionHeader: Locator;
  readonly employeeNameInput: Locator;
  readonly searchButton: Locator;
  readonly resultRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sectionHeader = page.getByText('Employee Information');
    // the "Employee Name" search box is an autocomplete ("Type for hints...")
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resultRows = page.locator('.oxd-table-card');
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
}
