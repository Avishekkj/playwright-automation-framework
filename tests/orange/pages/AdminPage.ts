// PAGE OBJECT for the Admin module (System Users) — search + results.

import { expect, type Page, type Locator } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly sectionHeader: Locator;
  readonly usernameInput: Locator;
  readonly searchButton: Locator;
  readonly resultRows: Locator;   // a LIST locator — the result table rows
  readonly noRecords: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sectionHeader = page.getByRole('heading', { name: 'System Users' });

    // find the Username box by filtering the input-group that contains "Username"
    // (robust: doesn't rely on brittle ids/positions)
    this.usernameInput = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Username' })
      .getByRole('textbox');

    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resultRows = page.locator('.oxd-table-card');
    // NOTE: "No Records Found" appears in BOTH a table span AND a toast popup.
    // Scope to the <span> so the locator matches exactly ONE element (no strict-mode clash).
    this.noRecords = page.locator('span').filter({ hasText: 'No Records Found' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/admin/);
    await expect(this.sectionHeader).toBeVisible();
  }

  async searchUser(username: string) {
    await this.usernameInput.fill(username);
    await this.searchButton.click();
  }
}
