// Employment Statuses API tests. Verify in the UI at: Admin → Job → Employment Status
import { test, expect } from '../fixtures';
import { employmentStatusSchema } from '../schemas/employment-status.schema';
import { log } from '../utils/logger';

test.describe('Zenith HR API — Employment Statuses', () => {
  test('GET list → 200 + valid shape', { tag: ['@smoke'] }, async ({ employmentStatusApi }) => {
    log.step(1, 'ask for the list of employment statuses');
    const res = await employmentStatusApi.list({ limit: 5 });
    log.step(2, 'expect 200 and a valid first item');
    expect(res.status).toBe(200);
    if (res.body.data.length) {
      expect(employmentStatusSchema.safeParse(res.body.data[0]).success).toBe(true);
    }
    log.pass('list works');
  });

  test('lifecycle: create → read → update → delete', { tag: ['@regression'] }, async ({ employmentStatusApi }) => {
    const name = `QA Status ${Date.now()}`;
    let id: number | undefined;
    try {
      log.step(1, `CREATE "${name}" (expect 200)`);
      const created = await employmentStatusApi.create({ name });
      expect(created.status).toBe(200);
      expect(employmentStatusSchema.safeParse(created.body.data).success).toBe(true);
      id = created.body.data.id;

      log.step(2, 'READ it back (expect 200)');
      const got = await employmentStatusApi.getById(id);
      expect(got.status).toBe(200);
      expect(got.body.data.name).toBe(name);

      log.step(3, 'UPDATE the name (PUT, expect 200)');
      const upd = await employmentStatusApi.update(id, { name: `${name} (updated)` });
      expect(upd.status).toBe(200);
      expect(upd.body.data.name).toBe(`${name} (updated)`);
    } finally {
      if (id) {
        log.step(4, 'DELETE (cleanup, expect 200 + returns our id)');
        const del = await employmentStatusApi.delete(id);
        expect(del.status).toBe(200);
        expect(del.body.data).toContain(String(id));
      }
    }
    log.pass('full CRUD works');
  });

  test('POST without a name → 422', { tag: ['@negative'] }, async ({ employmentStatusApi }) => {
    log.step(1, 'create with an empty body (not allowed)');
    const res = await employmentStatusApi.create({});
    log.step(2, 'expect 422 (bad data)');
    expect(res.status).toBe(422);
    log.pass('missing name rejected');
  });

  test('GET a status that does not exist → 404', { tag: ['@negative'] }, async ({ employmentStatusApi }) => {
    log.step(1, 'ask for an id that cannot exist');
    const res = await employmentStatusApi.getById(99999999);
    log.step(2, 'expect 404 (not found)');
    expect(res.status).toBe(404);
    log.pass('missing resource returns 404');
  });

  test('create one to VERIFY in the web UI', { tag: ['@ui-verify'] }, async ({ employmentStatusApi }) => {
    const name = `ZENITH-VERIFY-EmpStatus-${Date.now()}`;
    log.step(1, `create "${name}" and leave it`);
    const res = await employmentStatusApi.create({ name });
    expect(res.status).toBe(200);
    log.info('👉 verify in UI: Admin → Job → Employment Status');
    log.info(`   look for: ${name}`);
    log.pass('left in place for UI verification');
  });
});
