# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-employee.spec.ts >> E2E: add employee, make admin, verify, delete
- Location: tests/zenith-hr/e2e-employee.spec.ts:12:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'PIM' })

```

# Test source

```ts
  1  | // ============================================================================
  2  | // DashboardPage.ts — another Page Object CLASS. It follows the EXACT same
  3  | // OOP pattern as LoginPage: properties + constructor(this.page = page) + methods.
  4  | // (See LoginPage.ts for the full class/constructor/this explanations.)
  5  | // ============================================================================
  6  | 
  7  | import { expect, type Page, type Locator } from '@playwright/test';
  8  | 
  9  | export class DashboardPage {
  10 |   // PROPERTIES — this object's own locators
  11 |   readonly page: Page;
  12 |   readonly heading: Locator;
  13 |   readonly userDropdown: Locator;
  14 |   readonly menuItems: Locator;   // ONE locator that matches the whole menu LIST
  15 | 
  16 |   // CONSTRUCTOR — runs on `new DashboardPage(page)`; stores page + builds locators
  17 |   constructor(page: Page) {
  18 |     this.page = page;                                            // save the tab
  19 |     this.heading = page.getByRole('heading', { name: 'Dashboard' });
  20 |     this.userDropdown = page.locator('.oxd-userdropdown-name');
  21 |     this.menuItems = page.locator('.oxd-main-menu-item');
  22 |   }
  23 | 
  24 |   // METHOD — reusable "is the dashboard loaded?" check
  25 |   async expectLoaded() {
  26 |     await expect(this.page).toHaveURL(/dashboard/);
  27 |     await expect(this.heading).toBeVisible();
  28 |     await expect(this.userDropdown).toBeVisible();
  29 |   }
  30 | 
  31 |   // click a sidebar menu item by its name (e.g. 'Admin', 'PIM')
  32 |   async openMenu(name: string) {
> 33 |     await this.page.getByRole('link', { name }).click();
     |                                                 ^ Error: locator.click: Test timeout of 60000ms exceeded.
  34 |   }
  35 | 
  36 |   // open the user dropdown (top-right) and click Logout
  37 |   async logout() {
  38 |     await this.userDropdown.click();
  39 |     await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  40 |   }
  41 | 
  42 |   // ---- LIST / ARRAY helpers (all use `this.menuItems`) ----
  43 | 
  44 |   // how many items? (returns a Promise<number>)
  45 |   menuCount(): Promise<number> {
  46 |     return this.menuItems.count();
  47 |   }
  48 | 
  49 |   // text of a specific item — index is 0-based (2 = the 3rd item)
  50 |   async menuItemText(index: number): Promise<string> {
  51 |     return (await this.menuItems.nth(index).innerText()).trim();
  52 |   }
  53 | 
  54 |   // text of the LAST item
  55 |   async lastMenuItemText(): Promise<string> {
  56 |     return (await this.menuItems.last().innerText()).trim();
  57 |   }
  58 | 
  59 |   // every label as a plain string array (loop the list, read each)
  60 |   async allMenuLabels(): Promise<string[]> {
  61 |     const count = await this.menuItems.count();
  62 |     const labels: string[] = [];
  63 |     for (let i = 0; i < count; i++) {
  64 |       labels.push((await this.menuItems.nth(i).innerText()).trim());
  65 |     }
  66 |     return labels;
  67 |   }
  68 | }
  69 | 
```