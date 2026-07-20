// ============================================================================
// E2E [UI] — Employee Lifecycle
// The SAME "hire → verify → update → grant access → offboard" journey as the API
// version (zenith-hr-api-tests/tests/e2e/employee-lifecycle.api.e2e.spec.ts),
// but driven entirely through the browser. Each numbered step matches the API
// spec 1:1, so the two versions (and the future hybrid one) line up exactly.
//
// Everything is reached through ONE PageManager — the pattern that keeps a large
// UI suite maintainable (one import per test, all page wiring in one place).
// ============================================================================
import { test, expect } from '@playwright/test';
import { PageManager } from '../PageManager';
import { log } from '../utils/logger';

test.describe('E2E [UI] — Employee Lifecycle', () => {
  test('hire an employee, verify, update, grant access, then offboard',
    { tag: ['@e2e', '@regression'] }, async ({ page }) => {

    const app = new PageManager(page);

    // unique data so parallel / repeat runs never collide on the shared demo
    const stamp = Date.now();
    const first = 'E2e';
    const last = `Life${stamp}`;
    const fullName = `${first} ${last}`;
    const employeeId = String(stamp).slice(-9); // numeric, fits the field length
    const username = `life${employeeId}`;
    const password = 'Life@12345';

    // 1) Authenticate as Admin
    log.step(1, 'Log in as Admin');
    await app.loginPage.open();
    await app.loginPage.login('Admin', 'admin123');
    await app.dashboardPage.expectLoaded();

    // 2) Create employee (PIM → Add Employee)
    log.step(2, `Create employee "${fullName}" (employeeId ${employeeId})`);
    await app.dashboardPage.openMenu('PIM');
    await app.addEmployeePage.open();
    await app.addEmployeePage.addEmployee(first, last, employeeId);

    // 3) Capture identity — after save we land on the employee's profile
    log.step(3, 'Landed on the employee profile (identity captured)');
    await app.employeeProfilePage.expectLoaded();

    // 4) Verify the record shows the name we entered (UI equal of "GET by id")
    log.step(4, 'Verify the opened record shows the correct first name');
    await app.employeeProfilePage.expectFirstName(first);

    // 5) Search the employee in the PIM list
    log.step(5, `Search the PIM list for "${fullName}"`);
    await app.dashboardPage.openMenu('PIM');
    await app.pimPage.expectLoaded();
    await app.pimPage.searchEmployee(fullName);
    await app.pimPage.expectEmployeeInResults(last);

    // 6) Update personal details (rename firstName)
    log.step(6, 'Open the record and rename firstName -> "E2eUpdated"');
    await app.pimPage.editEmployee(last);
    await app.employeeProfilePage.expectLoaded();
    await app.employeeProfilePage.updateFirstName('E2eUpdated');
    await app.employeeProfilePage.expectFirstName('E2eUpdated');

    // 7) Add employment / job details
    log.step(7, 'Set job details (Job Title + Employment Status)');
    await app.employeeProfilePage.setJobDetails('QA Engineer', 'Full-Time Contract');

    // 8) Create a user linked to the employee (Admin → Add User, ESS role)
    log.step(8, 'Create an ESS user linked to the employee');
    await app.dashboardPage.openMenu('Admin');
    await app.adminPage.expectLoaded();
    await app.addUserPage.open();
    await app.addUserPage.createUser({
      role: 'ESS', employeeName: `E2eUpdated ${last}`, status: 'Enabled', username, password,
    });

    // 9) Retrieve the user and verify it exists / links to the employee
    log.step(9, 'Search System Users and verify the new user is listed');
    await app.adminPage.searchUser(username);
    await expect(app.adminPage.resultRows.first()).toBeVisible();

    // 10) Delete the user (offboard: revoke system access)
    log.step(10, 'Delete the user (revoke system access)');
    await app.adminPage.deleteFirstResult();
    await app.adminPage.searchUser(username);
    await expect(app.adminPage.noRecords).toBeVisible();

    // 11) Delete / terminate the employee
    log.step(11, 'Delete the employee from PIM');
    await app.dashboardPage.openMenu('PIM');
    await app.pimPage.expectLoaded();
    await app.pimPage.searchEmployee(last);
    await app.pimPage.expectEmployeeInResults(last);
    await app.pimPage.deleteEmployee(last);

    // 12) Confirm the employee no longer appears in a search
    log.step(12, 'Confirm the employee no longer appears in a PIM search');
    await app.pimPage.searchEmployee(last);
    await expect(app.pimPage.noRecords).toBeVisible();

    log.pass('Employee lifecycle E2E (UI) complete');
  });
});
