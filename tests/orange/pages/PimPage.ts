// PAGE OBJECT for the PIM module page (opened from the sidebar).

import { expect, type Page, type Locator } from '@playwright/test';

export class PimPage {
  readonly page: Page;
  readonly sectionHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sectionHeader = page.getByText('Employee Information');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/pim/);
    await expect(this.sectionHeader).toBeVisible();
  }
}
