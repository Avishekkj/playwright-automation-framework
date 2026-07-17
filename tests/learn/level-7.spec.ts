// LEVEL 7 — NEGATIVE testing: prove the API FAILS correctly on bad input.
// A good suite checks the sad paths, not just the happy path.
// Real GoRest here, so we test its ACTUAL security + validation rules.
//
// Cases:
//   401 Unauthorized  — create without a token
//   404 Not Found     — read a user that doesn't exist
//   422 Unprocessable — create with invalid data (data-driven, 3 rows)

import { test, expect } from '@playwright/test';
import { apiStep } from './logStep';
import { env } from '../../src/config/env';

const BASE = 'https://gorest.co.in/public/v2';
const AUTH = { Authorization: `Bearer ${env.token}` };

test.describe('Level 7 - negative testing (real GoRest)', () => {

  // ---- 401: no token = blocked ----
  test('401 - create without a token is rejected', async ({ playwright }) => {
    // 👈 NEW + GOTCHA: a blank newContext() still INHERITS the global
    //    Authorization header from playwright.config.ts. To be truly
    //    token-less, we must OVERRIDE extraHTTPHeaders with no auth in it.
    const anon = await playwright.request.newContext({
      extraHTTPHeaders: { 'Content-Type': 'application/json' }, // note: NO Authorization
    });

    const url = `${BASE}/users`;
    const res = await anon.post(url, {
      data: { name: 'X', email: `no_${Date.now()}@t.com`, gender: 'male', status: 'active' },
    });
    await apiStep({ label: '401 no token', method: 'POST', url, res, expectStatus: 401 });

    await anon.dispose();   // clean up the extra context
  });

  // ---- 404: missing resource ----
  test('404 - reading a user that does not exist', async ({ request }) => {
    const url = `${BASE}/users/999999999`;
    const res = await request.get(url);
    await apiStep({ label: '404 missing user', method: 'GET', url, res, expectStatus: 404 });
  });

  // ---- 422: invalid data (DATA-DRIVEN, reusing the Level 6 pattern) ----
  const invalidCases = [
    { name: 'bad email',      patch: { email: 'not-an-email' }, field: 'email' },
    { name: 'missing name',   patch: { name: '' },              field: 'name' },
    { name: 'invalid gender', patch: { gender: 'xyz' },         field: 'gender' },
  ];

  for (const c of invalidCases) {
    test(`422 - rejects ${c.name}`, async ({ request }) => {
      const url = `${BASE}/users`;
      // start from a VALID payload, then break ONE field with the patch.
      const data = {
        name: 'Test User',
        email: `ok_${Date.now()}@t.com`,
        gender: 'male',
        status: 'active',
        ...c.patch,
      };

      const res = await request.post(url, { headers: AUTH, data });
      const body = await apiStep({ label: `422 ${c.name}`, method: 'POST', url, res, expectStatus: 422 });

      // 👈 extra validation: GoRest returns [{ field, message }] — confirm it
      //    complained about the RIGHT field.
      const errors = body as { field: string; message: string }[];
      expect(errors.some((e) => e.field === c.field), `expected an error on "${c.field}"`).toBeTruthy();
    });
  }
});
