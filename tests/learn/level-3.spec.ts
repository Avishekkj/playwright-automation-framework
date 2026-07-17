// LEVEL 3 — CREATE a user (POST). Now we SEND data + prove who we are (token).
// Goal: create a new user and confirm the API saved it (201 Created).

import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';   // 👈 NEW: to read our secret token

test('level 3 - create a new user', async ({ request }) => {
  // 👈 NEW: a unique email every run, so GoRest never says "already taken" (422).
  const email = `qa_${Date.now()}@test.com`;

  // 👈 NEW: POST instead of GET. Two extra things vs Level 2:
  //   data    = the body we SEND (the new user's details)
  //   headers = our "ID card" — Bearer <token> proves we're allowed to create
  const resp = await request.post('https://gorest.co.in/public/v2/users', {
    headers: { Authorization: `Bearer ${env.token}` },
    data: {
      name: 'Test User',
      email: email,
      gender: 'male',
      status: 'active',
    },
  });

  // 👈 NEW: creating returns 201 ("Created"), NOT 200.
  console.log('status code:', resp.status());
  expect(resp.status()).toBe(201);

  // Read what the API saved and echoed back.
  const created = await resp.json();
  console.log('created user:', created);

  // 👈 NEW: the server gave the new user an id, and kept the email we sent.
  expect(created.id).toBeTruthy();          // an id exists
  expect(created.email).toBe(email);        // our email came back
});
