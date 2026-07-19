// job-titles.spec.ts
// THIS is the test file — the actual checks (test cases) live here.
// It uses the `jobTitleApi` helper (already logged in) to do things, then
// checks the results with expect(). Logs mark each step so you can follow along.
//
// Coverage in this one file:
//   • Methods:      GET, POST, PUT, DELETE
//   • Status codes: 200 (ok), 422 (bad data), 404 (missing), 401 (not logged in)
//   • Schema:       the response shape is validated
//   • Negative:     missing mandatory field, missing resource, no auth
//   • UI-verify:    one job title is left behind so you can SEE it in the web UI

import { test, expect } from '../fixtures';
import { JobTitleApi, type JobTitleInput } from '../clients/JobTitleApi';
import { jobTitleSchema } from '../schemas/job-title.schema';
import { BASE_URL } from '../env';

test.describe('Zenith HR API — Job Titles', () => {
  // ── GET: list works and the data has the right shape ──
  test('GET list of job titles → 200 + valid shape', { tag: ['@smoke'] }, async ({ jobTitleApi }) => {
    console.log('STEP 1: ask the app for the list of job titles');
    const res = await jobTitleApi.list({ limit: 5 });

    console.log('STEP 2: the app should answer 200 (OK)');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length) {
      console.log('STEP 3: the first job title should match our expected shape');
      const parsed = jobTitleSchema.safeParse(res.body.data[0]);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
    console.log('✅ DONE: list works');
  });

  // ── Full lifecycle: CREATE → READ → UPDATE → DELETE (all 4 methods) ──
  test('lifecycle: create → read → update → delete', { tag: ['@regression'] }, async ({ jobTitleApi }) => {
    const title = `Cloud Engineer Title ${Date.now()}`; // unique so runs never clash
    let id: number | undefined;

    try {
      console.log(`STEP 1: CREATE a job title "${title}"  (expect 200)`);
      const created = await jobTitleApi.create({ title });
      expect(created.status).toBe(200);
      expect(jobTitleSchema.safeParse(created.body.data).success).toBe(true);
      id = created.body.data.id;
      console.log(`   created with id=${id}`);

      console.log('STEP 2: READ it back  (expect 200)');
      const got = await jobTitleApi.getById(id);
      expect(got.status).toBe(200);
      expect(got.body.data.title).toBe(title);

      console.log('STEP 3: UPDATE the title  (PUT, expect 200)');
      const updated = await jobTitleApi.update(id, { title: `${title} (updated)` });
      expect(updated.status).toBe(200);
      expect(updated.body.data.title).toBe(`${title} (updated)`);
    } finally {
      if (id) {
        // NOTE: for job titles, GET a just-deleted id still returns 200 (only a
        // never-existed id gives 404). So we confirm deletion by checking the
        // DELETE response returns our id back — the app's own confirmation.
        console.log('STEP 4: DELETE it  (cleanup, expect 200 + it returns our id)');
        const del = await jobTitleApi.delete(id);
        expect(del.status).toBe(200);
        expect(del.body.data).toContain(String(id));
        console.log('   deleted and confirmed by the app');
      }
    }
    console.log('✅ DONE: full CRUD works');
  });

  // ── Negative: mandatory field missing → 422 ──
  test('POST without a title → 422', { tag: ['@negative'] }, async ({ jobTitleApi }) => {
    console.log('STEP 1: try to create a job title with NO title (not allowed)');
    const res = await jobTitleApi.create({} as unknown as JobTitleInput);

    console.log('STEP 2: the app should reject it with 422 (bad data)');
    expect(res.status).toBe(422);
    console.log('✅ DONE: missing title correctly rejected');
  });

  // ── Negative: resource does not exist → 404 ──
  test('GET a job title that does not exist → 404', { tag: ['@negative'] }, async ({ jobTitleApi }) => {
    console.log('STEP 1: ask for a job title id that cannot exist');
    const res = await jobTitleApi.getById(99999999);

    console.log('STEP 2: the app should say 404 (not found)');
    expect(res.status).toBe(404);
    console.log('✅ DONE: missing resource correctly returns 404');
  });

  // ── Negative: no login → 401 ──
  test('GET without logging in → 401', { tag: ['@negative'] }, async ({ playwright }) => {
    console.log('STEP 1: build a caller with NO login session');
    const anon = await playwright.request.newContext({ baseURL: BASE_URL });
    const api = new JobTitleApi(anon);

    console.log('STEP 2: try to list job titles without being logged in');
    const res = await api.list();

    console.log('STEP 3: the app should say 401 (who are you?)');
    expect(res.status).toBe(401);
    await anon.dispose();
    console.log('✅ DONE: unauthenticated request correctly blocked');
  });

  // ── UI-VERIFY: create one and LEAVE it, so you can check it in the web UI ──
  test('create a job title to VERIFY in the web UI', { tag: ['@ui-verify'] }, async ({ jobTitleApi }) => {
    const title = `ZENITH-VERIFY-${Date.now()}`;
    console.log(`STEP 1: create a clearly-named job title "${title}"`);
    const res = await jobTitleApi.create({ title, description: 'Created by an API test — verify me in the UI' });
    expect(res.status).toBe(200);

    console.log('STEP 2: (on purpose) NOT deleting it.');
    console.log('👉 To verify by hand: log in (Admin / admin123), then go to');
    console.log('   Admin → Job → Job Titles  and you will see:');
    console.log(`   "${title}"`);
    console.log('✅ DONE: created and left in place for UI verification');
  });
});
