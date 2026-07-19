// ============================================================================
// E2E [API] — RBAC Permission Boundary
// Prove the role boundary end to end: an ESS user can do employee things but is
// denied admin things, Admin can, and once disabled the ESS user can't log in.
// (Manages the whole lifecycle inline so we can re-authenticate after disabling.)
// ============================================================================
import { test, expect } from '../../fixtures';
import { apiLogin } from '../../utils/apiLogin';
import { log } from '../../utils/logger';
import { uniqueNumericId } from '../../utils/ids';

const API = '/web/index.php/api/v2';

test.describe('E2E [API] — RBAC Permission Boundary', () => {
  test('ESS is limited, Admin is not, and a disabled user cannot log in', { tag: ['@e2e', '@authorization'] }, async ({ peopleApi, adminUsersApi, playwright }) => {
    const stamp = Date.now();
    const employeeId = uniqueNumericId();
    const username = `bnd${employeeId}`;
    const password = 'Bnd@12345';
    let empNumber = 0;
    let userId = 0;

    try {
      // 1) Admin authentication — the fixtures carry the Admin session.
      log.step(1, 'Authenticated as Admin');

      // 2) Create employee
      log.step(2, 'Create an employee');
      const emp = await peopleApi.createEmployee({ firstName: 'Bnd', lastName: `U${stamp}`, employeeId });
      empNumber = emp.body.data.empNumber;
      expect(empNumber).toBeTruthy();

      // 3) Create an ESS user for the employee
      log.step(3, 'Create an ESS user for that employee');
      const user = await adminUsersApi.createUser({ username, password, status: true, userRoleId: 2, empNumber });
      expect(user.status).toBe(200);
      userId = user.body.data.id;

      // 4) Authenticate AS the ESS user
      log.step(4, 'Authenticate as the ESS user');
      const ess = await apiLogin(playwright.request, username, password);

      // 5 & 6) Permitted employee operations
      log.step(5, 'ESS retrieves the employee list (permitted)');
      expect((await ess.get(`${API}/pim/employees?limit=1`)).status()).toBe(200);
      log.step(6, 'ESS reads their own profile via PIM (permitted)');
      expect((await ess.get(`${API}/pim/employees/${empNumber}`)).status()).toBe(200);

      // 7 & 8) Restricted admin operation -> denied
      log.step(7, 'ESS attempts a restricted admin operation (admin/users)');
      const denied = await ess.get(`${API}/admin/users?limit=1`);
      log.step(8, 'Verify access is DENIED (403)');
      expect(denied.status()).toBe(403);
      await ess.dispose();

      // 9 & 10) Admin can do the same admin operation
      log.step(9, 'Authenticate as Admin (fixture)');
      log.step(10, 'Admin performs the same admin operation successfully (200)');
      expect((await adminUsersApi.listUsers({ limit: 1 })).status).toBe(200);

      // 11) Disable the ESS user
      log.step(11, 'Disable the ESS user (status: false)');
      const disabled = await adminUsersApi.updateUser(userId, { username, password, status: false, userRoleId: 2, empNumber });
      expect(disabled.status).toBe(200);

      // 12) Confirm the disabled user can no longer authenticate
      log.step(12, 'Confirm the disabled user can no longer authenticate');
      const dead = await apiLogin(playwright.request, username, password);
      expect((await dead.get(`${API}/pim/employees?limit=1`)).status()).toBe(401);
      await dead.dispose();
    } finally {
      // 13) Cleanup
      log.step(13, 'Cleanup user + employee');
      if (userId) await adminUsersApi.deleteUser(userId);
      if (empNumber) await peopleApi.deleteEmployee(empNumber);
    }
    log.pass('RBAC permission boundary E2E complete');
  });
});
