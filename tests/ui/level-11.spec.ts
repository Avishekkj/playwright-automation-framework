// LEVEL 11 — UI test using Page Objects + reused login (storageState).
// Thanks to the 'setup' project, this test starts ALREADY LOGGED IN.
// Notice: NO login steps here — we jump straight to the products page.

import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';

test('already logged in via storageState — Products page loads', async ({ page }) => {
  const inventory = new InventoryPage(page);

  await inventory.goto();          // straight to /inventory.html, no login needed
  await inventory.expectLoaded();  // "Products" title + at least one item visible

  // extra check: the demo store has 6 products
  expect(await inventory.itemCount()).toBe(6);
});
