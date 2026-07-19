// RBAC — roles & permissions.
// The essRequest fixture creates a fresh ESS user and logs in AS them, so we can
// prove an ESS user is blocked from admin actions but allowed on their own PIM.
// The adminUsersApi fixture is our Admin control (should be allowed).
import { test, expect } from '../fixtures';
import { log } from '../utils/logger';

const API = '/web/index.php/api/v2';

test.describe('Zenith HR API — RBAC (roles & permissions)', () => {
  test('ESS user is FORBIDDEN from admin endpoints (403)', { tag: ['@authorization'] }, async ({ essRequest }) => {
    log.step(1, 'ESS user tries to read admin/users');
    expect((await essRequest.get(`${API}/admin/users?limit=1`)).status()).toBe(403);

    log.step(2, 'ESS user tries to read admin/job-titles');
    expect((await essRequest.get(`${API}/admin/job-titles?limit=1`)).status()).toBe(403);

    log.pass('ESS correctly blocked from admin endpoints');
  });

  test('ESS user CAN access their own PIM (200)', { tag: ['@authorization'] }, async ({ essRequest }) => {
    log.step(1, 'ESS user reads pim/employees');
    expect((await essRequest.get(`${API}/pim/employees?limit=1`)).status()).toBe(200);
    log.pass('ESS allowed on PIM');
  });

  test('Admin CAN access admin endpoints (200) — control', { tag: ['@authorization'] }, async ({ adminUsersApi }) => {
    log.step(1, 'Admin lists users');
    expect((await adminUsersApi.listUsers({ limit: 1 })).status).toBe(200);
    log.pass('Admin allowed on admin endpoints');
  });
});
