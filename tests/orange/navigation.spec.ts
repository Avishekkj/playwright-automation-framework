// OrangeHRM — TC-06 (logout), TC-07 (Admin), TC-08 (PIM).
// beforeEach logs us in, so each test starts on the dashboard.

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PimPage } from './pages/PimPage';

test.describe('OrangeHRM - navigation & logout', () => {

  // log in before each test -> we land on the dashboard
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login('Admin', 'admin123');
    await new DashboardPage(page).expectLoaded();
  });

  // TC-06: logout returns to the login page
  test('TC-06 logout returns to login page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const login = new LoginPage(page);

    await dashboard.logout();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(login.loginButton).toBeVisible();  // login form is back
  });

  // TC-07: open the Admin module
  test('TC-07 open Admin module', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.openMenu('Admin');

    await expect(page).toHaveURL(/admin/);
    await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
  });

  // TC-08: open the PIM module
  test('TC-08 open PIM module', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const pim = new PimPage(page);

    await dashboard.openMenu('PIM');

    await pim.expectLoaded();
  });
});
