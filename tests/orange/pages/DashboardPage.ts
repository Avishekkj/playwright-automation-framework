// ============================================================================
// DashboardPage.ts — another Page Object CLASS. It follows the EXACT same
// OOP pattern as LoginPage: properties + constructor(this.page = page) + methods.
// (See LoginPage.ts for the full class/constructor/this explanations.)
// ============================================================================

import { expect, type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  // PROPERTIES — this object's own locators
  readonly page: Page;
  readonly heading: Locator;
  readonly userDropdown: Locator;
  readonly menuItems: Locator;   // ONE locator that matches the whole menu LIST

  // CONSTRUCTOR — runs on `new DashboardPage(page)`; stores page + builds locators
  constructor(page: Page) {
    this.page = page;                                            // save the tab
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.userDropdown = page.locator('.oxd-userdropdown-name');
    this.menuItems = page.locator('.oxd-main-menu-item');
  }

  // METHOD — reusable "is the dashboard loaded?" check
  async expectLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.heading).toBeVisible();
    await expect(this.userDropdown).toBeVisible();
  }

  // click a sidebar menu item by its name (e.g. 'Admin', 'PIM')
  async openMenu(name: string) {
    await this.page.getByRole('link', { name }).click();
  }

  // open the user dropdown (top-right) and click Logout
  async logout() {
    await this.userDropdown.click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }

  // ---- LIST / ARRAY helpers (all use `this.menuItems`) ----

  // how many items? (returns a Promise<number>)
  menuCount(): Promise<number> {
    return this.menuItems.count();
  }

  // text of a specific item — index is 0-based (2 = the 3rd item)
  async menuItemText(index: number): Promise<string> {
    return (await this.menuItems.nth(index).innerText()).trim();
  }

  // text of the LAST item
  async lastMenuItemText(): Promise<string> {
    return (await this.menuItems.last().innerText()).trim();
  }

  // every label as a plain string array (loop the list, read each)
  async allMenuLabels(): Promise<string[]> {
    const count = await this.menuItems.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      labels.push((await this.menuItems.nth(i).innerText()).trim());
    }
    return labels;
  }
}
