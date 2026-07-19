// ============================================================================
// E2E [API] — Employee Termination / Offboarding
// Goal: after offboarding, the person can no longer log in, protected calls are
// blocked, and they drop out of the active employee list.
//
// NOTE on the demo API: OrangeHRM's api/v2 does NOT expose date-based
// "terminate employment" (POST/PUT .../termination -> 404). So we offboard by
// deleting the user (revoke access) + deleting the employee (remove from active),
// which produces the same observable end-states. The UI version of this scenario
// CAN use the real "Terminate Employment" screen.
// ============================================================================
import { test, expect } from '../../fixtures';
import { apiLogin } from '../../utils/apiLogin';
import { log } from '../../utils/logger';
import { uniqueNumericId } from '../../utils/ids';

const API = '/web/index.php/api/v2';

test.describe('E2E [API] — Employee Termination / Offboarding', () => {
  test('offboarded employee cannot log in and is excluded from the active list', { tag: ['@e2e', '@regression'] }, async ({ peopleApi, adminUsersApi, playwright }) => {
    const stamp = Date.now();
    const employeeId = uniqueNumericId();
    const username = `term${employeeId}`;
    const password = 'Term@12345';
    let empNumber = 0;
    let userId = 0;

    // 1) Create employee
    log.step(1, 'Create an employee');
    empNumber = (await peopleApi.createEmployee({ firstName: 'Term', lastName: `U${stamp}`, employeeId })).body.data.empNumber;
    expect(empNumber).toBeTruthy();

    // 2) Create a user
    log.step(2, 'Create a user for the employee');
    userId = (await adminUsersApi.createUser({ username, password, status: true, userRoleId: 2, empNumber })).body.data.id;

    // 3) Authenticate successfully
    log.step(3, 'The user can authenticate + call a protected API (200)');
    const before = await apiLogin(playwright.request, username, password);
    expect((await before.get(`${API}/pim/employees?limit=1`)).status()).toBe(200);
    await before.dispose();

    // 4) Offboard: revoke access (delete the user)
    log.step(4, 'Offboard — revoke system access (delete user)');
    expect((await adminUsersApi.deleteUser(userId)).status).toBe(200);
    userId = 0;

    // 5/6/7/8) Re-authentication + protected call are now denied
    log.step(5, 'Attempt authentication again — protected call is now denied');
    const after = await apiLogin(playwright.request, username, password);
    const status = (await after.get(`${API}/pim/employees?limit=1`)).status();
    log.step(6, `Verify access is denied/restricted (got ${status})`);
    expect([401, 403]).toContain(status);
    await after.dispose();

    // 9) Search the active employee list (present before removal)
    log.step(9, 'Employee is still searchable while present');
    expect(((await peopleApi.listEmployees({ employeeId })).body.meta as { total: number }).total).toBe(1);

    // 10) Remove employee -> excluded from the list
    log.step(10, 'Remove the employee and confirm they are excluded from the active list');
    expect((await peopleApi.deleteEmployee(empNumber)).status).toBe(200);
    empNumber = 0;
    expect(((await peopleApi.listEmployees({ employeeId })).body.meta as { total: number }).total).toBe(0);

    // cleanup safety (if an assertion above failed mid-way)
    if (userId) await adminUsersApi.deleteUser(userId);
    if (empNumber) await peopleApi.deleteEmployee(empNumber);
    log.pass('Termination / offboarding E2E complete');
  });
});
