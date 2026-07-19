// Custom fixtures for the Zenith HR API suite.
// Each fixture hands a test an already-logged-in helper (the request context
// loads the saved session from .auth/zenith.json).

import { test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { ZenithHrApi } from './clients/ZenithHrApi';
import { JobTitleApi } from './clients/JobTitleApi';
import { CrudApi } from './clients/CrudApi';
import { AdminUsersApi } from './clients/AdminUsersApi';
import { apiLogin } from './utils/apiLogin';
import { BASE_URL, AUTH_FILE } from './env';

const ADMIN = '/web/index.php/api/v2/admin'; // the Admin part of the API

type Fixtures = {
  peopleApi: ZenithHrApi; // employees (logged in)
  anonApi: ZenithHrApi; // employees (NOT logged in) — for 401 tests
  jobTitleApi: JobTitleApi; // job titles (logged in)
  payGradeApi: CrudApi; // pay grades
  employmentStatusApi: CrudApi; // employment statuses
  jobCategoryApi: CrudApi; // job categories
  workShiftApi: CrudApi; // work shifts
  adminUsersApi: AdminUsersApi; // system users (admin, logged in)
  essRequest: APIRequestContext; // a caller logged in as a NEW ESS user (for RBAC)
};

export const test = base.extend<Fixtures>({
  peopleApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new ZenithHrApi(ctx));
    await ctx.dispose();
  },

  anonApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL }); // no session
    await use(new ZenithHrApi(ctx));
    await ctx.dispose();
  },

  jobTitleApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new JobTitleApi(ctx));
    await ctx.dispose();
  },

  // the 4 reference-data helpers all use the SAME generic CrudApi, just a
  // different URL + friendly name — that's why we didn't write 4 client files.
  payGradeApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new CrudApi(ctx, `${ADMIN}/pay-grades`, 'pay grade'));
    await ctx.dispose();
  },

  employmentStatusApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new CrudApi(ctx, `${ADMIN}/employment-statuses`, 'employment status'));
    await ctx.dispose();
  },

  jobCategoryApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new CrudApi(ctx, `${ADMIN}/job-categories`, 'job category'));
    await ctx.dispose();
  },

  workShiftApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new CrudApi(ctx, `${ADMIN}/work-shifts`, 'work shift'));
    await ctx.dispose();
  },

  adminUsersApi: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    await use(new AdminUsersApi(ctx));
    await ctx.dispose();
  },

  // ROLE fixture: as Admin, create a fresh employee + an ESS user, then log in
  // AS that ESS user and hand the test their (limited) session. Cleans up after.
  essRequest: async ({ playwright }, use) => {
    const adminCtx = await playwright.request.newContext({ baseURL: BASE_URL, storageState: AUTH_FILE });
    const employees = new ZenithHrApi(adminCtx);
    const users = new AdminUsersApi(adminCtx);

    const stamp = Date.now();
    const employeeId = String(stamp).slice(-7); // must be numeric
    const username = `ess${employeeId}`;
    const password = 'Ess@12345';

    // create the employee, then the ESS user for them
    const emp = await employees.createEmployee({ firstName: 'Rbac', lastName: `U${stamp}`, employeeId });
    const empNumber = (emp.body as { data: { empNumber: number } }).data.empNumber;
    const user = await users.createUser({ username, password, status: true, userRoleId: 2, empNumber });
    const userId = user.body.data.id;

    // log in AS the ESS user
    const essCtx = await apiLogin(playwright.request, username, password);
    await use(essCtx);

    // teardown: close the ESS session, then delete the user + employee as Admin
    await essCtx.dispose();
    await users.deleteUser(userId);
    await employees.deleteEmployee(empNumber);
    await adminCtx.dispose();
  },
});

export { expect } from '@playwright/test';
