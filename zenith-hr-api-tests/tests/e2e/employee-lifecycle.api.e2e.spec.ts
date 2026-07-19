// ============================================================================
// E2E [API] — Employee Lifecycle
// The full "hire → verify → update → give system access → offboard" journey,
// driven entirely through the API. Each numbered step matches the scenario doc
// so the UI and UI+API versions can follow the exact same 12 steps later.
// ============================================================================
import { test, expect } from '../../fixtures';
import { log } from '../../utils/logger';
import { uniqueNumericId } from '../../utils/ids';

test.describe('E2E [API] — Employee Lifecycle', () => {
  test('hire an employee, verify, update, grant access, then offboard', { tag: ['@e2e', '@regression'] }, async ({ peopleApi, adminUsersApi }) => {
    const stamp = Date.now();
    const employeeId = uniqueNumericId(); // must be numeric
    const lastName = `Life${stamp}`;
    let empNumber = 0;
    let userId = 0;

    // 1) Authenticate as Admin — the fixtures already carry the Admin session.
    log.step(1, 'Authenticated as Admin (saved session)');

    // 2) Create employee
    log.step(2, `Create employee "E2e ${lastName}" (employeeId ${employeeId})`);
    const created = await peopleApi.createEmployee({ firstName: 'E2e', lastName, employeeId });
    expect(created.status).toBe(200);

    // 3) Capture empNumber from the response
    empNumber = created.body.data.empNumber;
    log.step(3, `Captured empNumber = ${empNumber}`);
    expect(empNumber).toBeTruthy();

    // 4) GET the employee by empNumber
    log.step(4, 'GET the employee by empNumber');
    expect((await peopleApi.getEmployee(empNumber)).status).toBe(200);

    // 5) Search the employee through the list API
    log.step(5, `Search the list API by employeeId=${employeeId}`);
    const search = await peopleApi.listEmployees({ employeeId });
    expect(search.status).toBe(200);
    expect((search.body.meta as { total: number }).total).toBe(1);

    // 6) Update employee information (rename firstName)
    log.step(6, 'Update personal details (firstName -> "E2eUpdated")');
    const upd = await peopleApi.updatePersonalDetails(empNumber, { firstName: 'E2eUpdated', lastName, employeeId });
    expect(upd.status).toBe(200);
    expect(upd.body.data.firstName).toBe('E2eUpdated');

    // 7) Add employment / job details
    log.step(7, 'Add job details (job title, employment status, category)');
    expect((await peopleApi.updateJobDetails(empNumber, { jobTitleId: 1, empStatusId: 1, jobCategoryId: 7 })).status).toBe(200);

    // 8) Create a user linked to the employee
    log.step(8, 'Create an ESS user linked to the employee');
    const user = await adminUsersApi.createUser({ username: `life${employeeId}`, password: 'Life@12345', status: true, userRoleId: 2, empNumber });
    expect(user.status).toBe(200);
    userId = user.body.data.id;

    // 9) Retrieve the user and verify the linkage
    log.step(9, 'Retrieve the user and verify it links back to our employee');
    const gotUser = await adminUsersApi.getUser(userId);
    expect(gotUser.status).toBe(200);
    expect(gotUser.body.data.employee?.empNumber).toBe(empNumber);

    // 10) Delete the user (offboard: revoke system access)
    log.step(10, 'Delete the user (revoke system access)');
    expect((await adminUsersApi.deleteUser(userId)).status).toBe(200);
    userId = 0;

    // 11) Delete / terminate the employee
    log.step(11, 'Delete the employee');
    expect((await peopleApi.deleteEmployee(empNumber)).status).toBe(200);

    // 12) Confirm the employee is no longer returned in the list
    log.step(12, 'Confirm the employee no longer appears in a search');
    const after = await peopleApi.listEmployees({ employeeId });
    expect((after.body.meta as { total: number }).total).toBe(0);

    log.pass('Employee lifecycle E2E complete');
  });
});
