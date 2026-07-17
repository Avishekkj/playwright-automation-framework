// LEVEL 4 — create a user, THEN delete it so we leave nothing behind.
// This is the MANUAL way (afterEach). In Level 5 we'll make it cleaner.

import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';

const BASE = 'https://gorest.co.in/public/v2/users';
const AUTH = { Authorization: `Bearer ${env.token}` };

// 👈 NEW: a box OUTSIDE the test to remember which user we made,
//        so the cleanup step below knows what to delete.
let createdUserId: number;

test('level 4 - create a user (cleaned up afterward)', async ({ request }) => {
  const email = `qa_${Date.now()}@test.com`;

  const resp = await request.post(BASE, {
    headers: AUTH,
    data: { name: 'Test User', email, gender: 'male', status: 'active' },
  });
  expect(resp.status()).toBe(201);

  const created = await resp.json();
  createdUserId = created.id;                 // 👈 NEW: save the id for cleanup
  console.log('created user id:', createdUserId);

  expect(created.email).toBe(email);
});

// 👈 NEW: afterEach runs AFTER the test — even if the test failed.
//        Notice the awkward part: cleanup is SEPARATE from the create,
//        and we had to smuggle the id out through an outside variable.
test.afterEach(async ({ request }) => {
  if (!createdUserId) return;                 // nothing to clean if none made

  const del = await request.delete(`${BASE}/${createdUserId}`, { headers: AUTH });
  console.log('cleanup delete status:', del.status());
  expect(del.status()).toBe(204);             // 👈 204 = "done, nothing to return"
});
