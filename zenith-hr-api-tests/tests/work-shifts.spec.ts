// Work Shifts API tests. This one is a bit richer than the others: creating a
// shift needs name + times + hoursPerDay (as a STRING "9.00") + empNumbers.
// It also shows a real 5xx case: an empty body makes the server return 500.
// Verify in the UI at: Admin → Job → Work Shifts
import { test, expect } from '../fixtures';
import { workShiftSchema } from '../schemas/work-shift.schema';
import { log } from '../utils/logger';

// build a valid work-shift payload (hoursPerDay must be a STRING)
function newShift(name: string) {
  return { name, startTime: '09:00', endTime: '18:00', hoursPerDay: '9.00', empNumbers: [] };
}

test.describe('Zenith HR API — Work Shifts', () => {
  test('GET list → 200 + valid shape', { tag: ['@smoke'] }, async ({ workShiftApi }) => {
    log.step(1, 'ask for the list of work shifts');
    const res = await workShiftApi.list({ limit: 5 });
    log.step(2, 'expect 200 and a valid first item');
    expect(res.status).toBe(200);
    if (res.body.data.length) {
      expect(workShiftSchema.safeParse(res.body.data[0]).success).toBe(true);
    }
    log.pass('list works');
  });

  test('lifecycle: create → read → update → delete', { tag: ['@regression'] }, async ({ workShiftApi }) => {
    const name = `QA Shift ${Date.now()}`;
    let id: number | undefined;
    try {
      log.step(1, `CREATE "${name}" with times + hoursPerDay (expect 200)`);
      const created = await workShiftApi.create(newShift(name));
      expect(created.status).toBe(200);
      expect(workShiftSchema.safeParse(created.body.data).success).toBe(true);
      id = created.body.data.id;

      log.step(2, 'READ it back (expect 200)');
      const got = await workShiftApi.getById(id);
      expect(got.status).toBe(200);
      expect(got.body.data.name).toBe(name);

      log.step(3, 'UPDATE the name (PUT, expect 200)');
      const upd = await workShiftApi.update(id, newShift(`${name} (updated)`));
      expect(upd.status).toBe(200);
      expect(upd.body.data.name).toBe(`${name} (updated)`);
    } finally {
      if (id) {
        log.step(4, 'DELETE (cleanup, expect 200 + returns our id)');
        const del = await workShiftApi.delete(id);
        expect(del.status).toBe(200);
        expect(del.body.data).toContain(String(id));
      }
    }
    log.pass('full CRUD works');
  });

  test('POST missing hoursPerDay → 422', { tag: ['@negative'] }, async ({ workShiftApi }) => {
    log.step(1, 'create a shift but leave out hoursPerDay (a required field)');
    const res = await workShiftApi.create({ name: `bad ${Date.now()}`, startTime: '09:00', endTime: '18:00', empNumbers: [] });
    log.step(2, 'expect 422 (bad data)');
    expect(res.status).toBe(422);
    log.pass('missing required field rejected');
  });

  test('POST a completely empty body → 500 (server error)', { tag: ['@negative'] }, async ({ workShiftApi }) => {
    log.step(1, 'send a totally empty body (the app cannot handle it)');
    const res = await workShiftApi.create({});
    log.step(2, 'the server returns 500 — we assert we get that, not a crash on our side');
    expect(res.status).toBe(500);
    log.pass('server 5xx handled gracefully by the test');
  });

  test('GET a shift that does not exist → 404', { tag: ['@negative'] }, async ({ workShiftApi }) => {
    log.step(1, 'ask for an id that cannot exist');
    const res = await workShiftApi.getById(99999999);
    log.step(2, 'expect 404 (not found)');
    expect(res.status).toBe(404);
    log.pass('missing resource returns 404');
  });

  test('create one to VERIFY in the web UI', { tag: ['@ui-verify'] }, async ({ workShiftApi }) => {
    const name = `ZENITH-VERIFY-WorkShift-${Date.now()}`;
    log.step(1, `create "${name}" and leave it`);
    const res = await workShiftApi.create(newShift(name));
    expect(res.status).toBe(200);
    log.info('👉 verify in UI: Admin → Job → Work Shifts');
    log.info(`   look for: ${name}`);
    log.pass('left in place for UI verification');
  });
});
