// Pay Grades API tests. Uses the generic CrudApi (via the payGradeApi fixture).
// Verify in the UI at: Admin → Job → Pay Grades
import { test, expect } from '../fixtures';
import { payGradeSchema } from '../schemas/pay-grade.schema';
import { log } from '../utils/logger';

test.describe('Zenith HR API — Pay Grades', () => {
  test('GET list → 200 + valid shape', { tag: ['@smoke'] }, async ({ payGradeApi }) => {
    log.step(1, 'ask for the list of pay grades');
    const res = await payGradeApi.list({ limit: 5 });
    log.step(2, 'expect 200 and a valid first item');
    expect(res.status).toBe(200);
    if (res.body.data.length) {
      expect(payGradeSchema.safeParse(res.body.data[0]).success).toBe(true);
    }
    log.pass('list works');
  });

  test('lifecycle: create → read → update → delete', { tag: ['@regression'] }, async ({ payGradeApi }) => {
    const name = `QA Grade ${Date.now()}`;
    let id: number | undefined;
    try {
      log.step(1, `CREATE "${name}" (expect 200)`);
      const created = await payGradeApi.create({ name });
      expect(created.status).toBe(200);
      expect(payGradeSchema.safeParse(created.body.data).success).toBe(true);
      id = created.body.data.id;

      log.step(2, 'READ it back (expect 200)');
      const got = await payGradeApi.getById(id);
      expect(got.status).toBe(200);
      expect(got.body.data.name).toBe(name);

      log.step(3, 'UPDATE the name (PUT, expect 200)');
      const upd = await payGradeApi.update(id, { name: `${name} (updated)` });
      expect(upd.status).toBe(200);
      expect(upd.body.data.name).toBe(`${name} (updated)`);
    } finally {
      if (id) {
        log.step(4, 'DELETE (cleanup, expect 200 + returns our id)');
        const del = await payGradeApi.delete(id);
        expect(del.status).toBe(200);
        expect(del.body.data).toContain(String(id));
      }
    }
    log.pass('full CRUD works');
  });

  test('POST without a name → 422', { tag: ['@negative'] }, async ({ payGradeApi }) => {
    log.step(1, 'create with an empty body (not allowed)');
    const res = await payGradeApi.create({});
    log.step(2, 'expect 422 (bad data)');
    expect(res.status).toBe(422);
    log.pass('missing name rejected');
  });

  test('GET a pay grade that does not exist → 404', { tag: ['@negative'] }, async ({ payGradeApi }) => {
    log.step(1, 'ask for an id that cannot exist');
    const res = await payGradeApi.getById(99999999);
    log.step(2, 'expect 404 (not found)');
    expect(res.status).toBe(404);
    log.pass('missing resource returns 404');
  });

  test('create one to VERIFY in the web UI', { tag: ['@ui-verify'] }, async ({ payGradeApi }) => {
    const name = `ZENITH-VERIFY-PayGrade-${Date.now()}`;
    log.step(1, `create "${name}" and leave it`);
    const res = await payGradeApi.create({ name });
    expect(res.status).toBe(200);
    log.info('👉 verify in UI: Admin → Job → Pay Grades');
    log.info(`   look for: ${name}`);
    log.pass('left in place for UI verification');
  });
});
