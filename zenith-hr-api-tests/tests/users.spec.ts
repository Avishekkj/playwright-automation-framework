// Admin Users API tests. A user links an employee to a role.
// Verify in the UI at: Admin → User Management → Users
import { test, expect } from '../fixtures';
import { userSchema } from '../schemas/user.schema';
import { type UserInput } from '../clients/AdminUsersApi';
import { log } from '../utils/logger';

test.describe('Zenith HR API — Admin Users', () => {
  test('GET list users → 200 + valid shape', { tag: ['@smoke'] }, async ({ adminUsersApi }) => {
    log.step(1, 'ask for the list of users');
    const res = await adminUsersApi.listUsers({ limit: 5 });
    log.step(2, 'expect 200 and a valid first user');
    expect(res.status).toBe(200);
    if (res.body.data.length) {
      expect(userSchema.safeParse(res.body.data[0]).success).toBe(true);
    }
    log.pass('list works');
  });

  test('lifecycle: create user (for an employee) → read → delete', { tag: ['@regression'] }, async ({ adminUsersApi, peopleApi }) => {
    const stamp = Date.now();
    const employeeId = String(stamp).slice(-7); // numeric id
    let empNumber: number | undefined;
    let userId: number | undefined;
    try {
      log.step(1, 'create an employee (a user must belong to one)');
      const emp = await peopleApi.createEmployee({ firstName: 'Usr', lastName: `T${stamp}`, employeeId });
      empNumber = (emp.body as { data: { empNumber: number } }).data.empNumber;
      expect(empNumber, 'employee was created').toBeTruthy();

      log.step(2, 'create an ESS user for that employee (expect 200)');
      const created = await adminUsersApi.createUser({
        username: `usr${employeeId}`,
        password: 'Usr@12345',
        status: true,
        userRoleId: 2,
        empNumber,
      });
      expect(created.status).toBe(200);
      expect(userSchema.safeParse(created.body.data).success).toBe(true);
      userId = created.body.data.id;

      log.step(3, 'read the user back (expect 200)');
      const got = await adminUsersApi.getUser(userId);
      expect(got.status).toBe(200);
    } finally {
      if (userId) {
        log.step(4, 'delete the user (cleanup, expect 200)');
        const del = await adminUsersApi.deleteUser(userId);
        expect(del.status).toBe(200);
      }
      if (empNumber) {
        log.info('delete the employee too (cleanup)');
        await peopleApi.deleteEmployee(empNumber);
      }
    }
    log.pass('user CRUD works');
  });

  test('POST create user with empty body → 422', { tag: ['@negative'] }, async ({ adminUsersApi }) => {
    log.step(1, 'create a user with no data (not allowed)');
    const res = await adminUsersApi.createUser({} as unknown as UserInput);
    log.step(2, 'expect 422 (bad data)');
    expect(res.status).toBe(422);
    log.pass('missing fields rejected');
  });
});
