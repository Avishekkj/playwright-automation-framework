// Page Object for the Products (inventory) page shown after login.

import { expect, type Page, type Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.items = page.locator('.inventory_item');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  // a reusable assertion — "is this page properly loaded?"
  async expectLoaded() {
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }
}
