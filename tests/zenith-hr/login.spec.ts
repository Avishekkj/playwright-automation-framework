// ============================================================================
// login.spec.ts — the TEST (the scenario). It USES the Page Object classes.
// This file explains HOW the flow moves between the test and the page objects.
// ============================================================================

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';         // import the class (blueprint)
import { DashboardPage } from './pages/DashboardPage';

test('Zenith HR login + explore the menu list (POM)', async ({ page }) => {

  // 🔷 `new LoginPage(page)` = CREATE AN OBJECT from the blueprint.
  //    This is the moment the constructor in LoginPage.ts runs. We pass in
  //    `page` (the browser tab Playwright gave this test). Now `loginPage`
  //    is a real object whose `this.page` is the SAME tab this test controls.
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);   // both objects share the SAME page

  // ---- how the flow "jumps" between files ----
  //
  //   THIS FILE (test)                 LoginPage.ts (class)
  //   ----------------                 --------------------
  //   loginPage.open()      ──────►    async open() { this.page.goto(...) }
  //                         ◄──────    (returns here when done)
  //   loginPage.login(...)  ──────►    async login() { fill; fill; click }
  //                         ◄──────    (returns here)
  //
  //   Calling a method sends control INTO the class method; when it finishes,
  //   control comes BACK to the next line here. `await` waits for each jump.

  // STEP 1: open login page + verify it rendered
  await loginPage.open();          // jumps into LoginPage.open()
  await loginPage.expectLoaded();  // jumps into LoginPage.expectLoaded()

  // STEP 2: log in  (we give the data; the page object knows the mechanics)
  await loginPage.login('Admin', 'admin123');

  // STEP 3: verify the dashboard  (now we talk to the OTHER object)
  await dashboard.expectLoaded();

  // STEP 4: work with the menu LIST via the dashboard object's helpers
  const count = await dashboard.menuCount();
  console.log('👉 menu items:', count);
  expect(count).toBeGreaterThan(5);

  console.log('third item:', await dashboard.menuItemText(2)); // 0-based -> 3rd
  console.log('last  item:', await dashboard.lastMenuItemText());

  const labels = await dashboard.allMenuLabels();
  console.log('👉 all labels:', labels);
  expect(labels).toContain('Admin');
  expect(labels).toContain('PIM');
});
