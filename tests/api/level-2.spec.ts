// LEVEL 2 — check WHAT came back, not just that the API answered.
// Goal: confirm the reply is actually a non-empty LIST of users.

import { test, expect } from '@playwright/test';

test('level 2 - we get a non-empty list of users', async ({ request }) => {
  const resp = await request.get('https://gorest.co.in/public/v2/users');

  // ⚠️ GOTCHA (from your Level 1 line 11): status is a FUNCTION — CALL it with ().
  //   resp.status   → the function itself  → prints "[Function: status]"
  //   resp.status() → the actual number    → 200
  console.log('status code:', resp.status());

  // Check the reply code first.
  expect(resp.status()).toBe(200);

  // 👈 NEW: unwrap the reply body into real data (a list of users).
  const users = await resp.json();
  console.log('how many users came back:', users.length);

  // 👈 NEW: check it's actually an array (a list), not an error object.
  expect(Array.isArray(users)).toBe(true);

  // 👈 NEW: check the list isn't empty — we got at least one user.
  expect(users.length).toBeGreaterThan(0);
});
