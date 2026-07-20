// ============================================================================
// PageManager — the single entry point to ALL page objects.
// A test creates ONE PageManager, then reaches every page through it:
//     const app = new PageManager(page);
//     await app.loginPage.login(...);
//     await app.pimPage.searchEmployee(...);
//
// Why this scales to thousands of tests:
//  - tests import ONE class, not a dozen page imports each
//  - all wiring (which page objects exist) lives in ONE place
//  - add a new page? register it here once, every test can use it
// ============================================================================

import type { Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { PimPage } from './pages/PimPage';
import { PimAddEmployeePage } from './pages/PimAddEmployeePage';
import { PimEmployeeProfilePage } from './pages/PimEmployeeProfilePage';
import { AdminAddUserPage } from './pages/AdminAddUserPage';

export class PageManager {
  readonly page: Page;

  // every page object, created once and shared for this test
  readonly loginPage: LoginPage;
  readonly dashboardPage: DashboardPage;
  readonly adminPage: AdminPage;
  readonly pimPage: PimPage;
  readonly addEmployeePage: PimAddEmployeePage;
  readonly employeeProfilePage: PimEmployeeProfilePage;
  readonly addUserPage: AdminAddUserPage;

  constructor(page: Page) {
    this.page = page;
    // wire them all up with the same browser tab
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.adminPage = new AdminPage(page);
    this.pimPage = new PimPage(page);
    this.addEmployeePage = new PimAddEmployeePage(page);
    this.employeeProfilePage = new PimEmployeeProfilePage(page);
    this.addUserPage = new AdminAddUserPage(page);
  }
}
