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

  // open the edit form for the first result row (click its pencil icon)
  async editFirstResult() {
    await this.resultRows.first().locator('button:has(.bi-pencil-fill)').click();
    await expect(this.page).toHaveURL(/saveSystemUser/);
  }

  // delete the first result row: click its trash icon, then confirm the dialog
  async deleteFirstResult()  {
  // click the delete BUTTON on the first row, not the raw <i> icon
  await this.resultRows.first().locator('button:has(.bi-trash)').click();

  // web-first assertion: if the modal never opens, this fails fast
  // at the REAL cause (~5s) instead of hanging the full 60s at the click
  const confirm = this.page.getByRole('button', { name: 'Yes, Delete' });
  await expect(confirm).toBeVisible();
  await confirm.click();

  // confirm the delete actually happened
  await expect(this.page.getByText('Successfully Deleted')).toBeVisible();
}
}
