// ============================================================================
// E2E [UI] — RBAC Permission Boundary
// The SAME role-boundary journey as the API version
// (zenith-hr-api-tests/tests/e2e/rbac-permission-boundary.api.e2e.spec.ts),
// driven through the browser. Numbered steps match the API spec 1:1.
//
// What it proves, visually:
//   • an ESS user CAN reach their own info, but the "Admin" menu isn't even there
//   • an Admin CAN reach Admin
//   • once disabled, the ESS user can no longer log in
//
// NOTE on user-switching: we switch users by clearing cookies + logging in fresh,
// NOT by clicking the UI "Logout" (which is flaky on the demo and isn't what this
// scenario is testing). Cleanup runs in afterEach so it has its OWN timeout budget.
// ============================================================================
import { test, expect, type Page } from '@playwright/test';
import { PageManager } from '../PageManager';
import { log } from '../utils/logger';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../../src/config/credentials';

// switch to a given user deterministically: drop the session, then log in fresh
async function loginAs(page: Page, app: PageManager, user: string, pass: string) {
  await page.context().clearCookies();
  await app.loginPage.open();
  await app.loginPage.login(user, pass);
}

test.describe('E2E [UI] — RBAC Permission Boundary', () => {
  // what the test created, so afterEach can clean it up even if the test fails
  let created: { username?: string; last?: string } = {};

  test.afterEach(async ({ page }) => {
    if (!created.username && !created.last) return;
    test.setTimeout(180_000); // cleanup gets its own budget (login + search + delete)
    const app = new PageManager(page);
    await loginAs(page, app, ADMIN_USERNAME, ADMIN_PASSWORD);
    await app.dashboardPage.expectLoaded();

    if (created.username) {
      await app.dashboardPage.openMenu('Admin');
      await app.adminPage.searchUser(created.username);
      if (await app.adminPage.resultRows.count()) await app.adminPage.deleteFirstResult();
    }
    if (created.last) {
      await app.dashboardPage.openMenu('PIM');
      await app.pimPage.searchEmployee(created.last);
      if (await app.pimPage.resultRows.filter({ hasText: created.last }).count()) {
        await app.pimPage.deleteEmployee(created.last);
      }
    }
    created = {};
  });

  test('ESS is limited, Admin is not, and a disabled user cannot log in',
    { tag: ['@e2e', '@authorization'] }, async ({ page }) => {

    // long journey (multiple logins + creates) on the slow demo — 4 minutes
    test.setTimeout(240_000);
    const app = new PageManager(page);

    const stamp = Date.now();
    const first = 'Rbac';
    const last = `U${stamp}`;
    const fullName = `${first} ${last}`;
    const employeeId = String(stamp).slice(-9);
    const username = `bnd${employeeId}`;
    const password = 'Bnd@12345';

    // 1) Authenticate as Admin
    log.step(1, 'Log in as Admin');
    await loginAs(page, app, ADMIN_USERNAME, ADMIN_PASSWORD);
    await app.dashboardPage.expectLoaded();

    // 2) Create an employee
    log.step(2, `Create employee "${fullName}"`);
    await app.dashboardPage.openMenu('PIM');
    await app.addEmployeePage.open();
    await app.addEmployeePage.addEmployee(first, last, employeeId);
    created.last = last; // mark for cleanup

    // 3) Create an ESS user for that employee (this also proves Admin CAN do admin)
    log.step(3, 'Create an ESS user for that employee');
    await app.dashboardPage.openMenu('Admin');
    await app.adminPage.expectLoaded();
    await app.addUserPage.open();
    await app.addUserPage.createUser({
      role: 'ESS', employeeName: fullName, status: 'Enabled', username, password,
    });
    created.username = username; // mark for cleanup

    // 4) Log in AS the ESS user
    log.step(4, 'Log in as the ESS user');
    await loginAs(page, app, username, password);
    await app.dashboardPage.expectLoaded();

    // 5) Permitted — the ESS user CAN see their own info ("My Info" menu present)
    log.step(5, 'ESS can see "My Info" (permitted)');
    await expect(page.getByRole('link', { name: 'My Info' })).toBeVisible();

    // 6) Permitted — open My Info → their Personal Details load
    log.step(6, 'ESS opens My Info → Personal Details (permitted)');
    await app.dashboardPage.openMenu('My Info');
    await expect(page).toHaveURL(/viewPersonalDetails|viewMyDetails/);

    // 7 & 8) Restricted — the "Admin" menu is NOT available to an ESS user (denied)
    log.step(7, 'ESS attempts to reach Admin — the menu is not available');
    log.step(8, 'Verify access is DENIED (no Admin menu item)');
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);

    // 9 & 10) Admin CAN reach Admin
    log.step(9, 'Log back in as Admin');
    await loginAs(page, app, ADMIN_USERNAME, ADMIN_PASSWORD);
    await app.dashboardPage.expectLoaded();
    log.step(10, 'Admin can reach Admin (permitted)');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await app.dashboardPage.openMenu('Admin');
    await app.adminPage.expectLoaded();

    // 11) Disable the ESS user
    log.step(11, 'Disable the ESS user (Status → Disabled)');
    await app.adminPage.searchUser(username);
    await app.adminPage.editFirstResult();
    await app.addUserPage.updateStatus('Disabled');

    // 12) Confirm the disabled user can no longer authenticate
    log.step(12, 'Confirm the disabled user can no longer log in');
    await loginAs(page, app, username, password);
    await expect(app.loginPage.errorAlert).toBeVisible(); // "Invalid credentials"
    await expect(page).not.toHaveURL(/dashboard/);

    log.pass('RBAC permission boundary E2E (UI) complete');
    // (cleanup happens in afterEach)
  });
});
