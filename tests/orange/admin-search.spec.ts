// OrangeHRM — TC-09 (search existing user) + TC-10 (search non-existent user).
// beforeEach: log in, then open the Admin module, so each test starts there.

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

test.describe('OrangeHRM - Admin user search', () => {
  let admin: AdminPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login('Admin', 'admin123');

    const dashboard = new DashboardPage(page);
    await dashboard.expectLoaded();
    await dashboard.openMenu('Admin');

    admin = new AdminPage(page);
    await admin.expectLoaded();
  });

  // TC-09: searching an existing user returns at least one row
  test('TC-09 search existing user "Admin" returns a result', async () => {
    await admin.searchUser('Admin');

    await expect(admin.resultRows.first()).toBeVisible();
    expect(await admin.resultRows.count()).toBeGreaterThan(0);
  });

  // TC-10: searching a non-existent user shows "No Records Found"
  test('TC-10 search non-existent user shows No Records Found', async () => {
    await admin.searchUser('zzzznobody123');

    await expect(admin.noRecords).toBeVisible();
  });
});
