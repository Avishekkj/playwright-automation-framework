// END-TO-END employee lifecycle, driven entirely through ONE PageManager object.
// Flow: login -> add employee -> search employee -> make them an Admin (system
//       user) -> verify the user -> delete the user.
//
// Notice: we create `app = new PageManager(page)` ONCE, then reach every screen
// through it (app.loginPage, app.pimPage, app.adminPage ...). That's the pattern
// that keeps a 2000-test suite maintainable.

import { test, expect } from '@playwright/test';
import { PageManager } from './PageManager';

test('E2E: add employee, make admin, verify, delete', async ({ page }) => {
  const app = new PageManager(page);

  // unique data so parallel runs / repeat runs never collide
  const stamp = Date.now();
  const first = 'Auto';
  const last = `Emp${stamp}`;
  const fullName = `${first} ${last}`;
  const username = `autouser${stamp}`;
  const password = 'Auto@1234';
  const employeeId = String(stamp).slice(-9); // unique, fits the field's max length

  // 1) LOGIN
  await app.loginPage.open();
  await app.loginPage.login('Admin', 'admin123');
  await app.dashboardPage.expectLoaded();

  // 2) ADD EMPLOYEE (PIM)
  await app.dashboardPage.openMenu('PIM');
  await app.addEmployeePage.open();
  await app.addEmployeePage.addEmployee(first, last, employeeId);
  console.log('✓ created employee:', fullName);

  // 3) SEARCH the employee in the PIM list
  await app.dashboardPage.openMenu('PIM');
  await app.pimPage.expectLoaded();
  await app.pimPage.searchEmployee(fullName);
  await app.pimPage.expectEmployeeInResults(last);
  console.log('✓ found employee in PIM');

  // 4) MAKE THEM AN ADMIN (create a system user)
  await app.dashboardPage.openMenu('Admin');
  await app.adminPage.expectLoaded();
  await app.addUserPage.open();
  await app.addUserPage.createUser({
    role: 'Admin',
    employeeName: fullName,
    status: 'Enabled',
    username,
    password,
  });
  console.log('✓ created admin user:', username);

  // 5) VERIFY the user exists
  await app.adminPage.searchUser(username);
  await expect(app.adminPage.resultRows.first()).toBeVisible();
  console.log('✓ verified user in Admin');

  // 6) DELETE the user + confirm it's gone
  await app.adminPage.deleteFirstResult();
  await app.adminPage.searchUser(username);
  await expect(app.adminPage.noRecords).toBeVisible();
  console.log('✓ deleted user');
});
