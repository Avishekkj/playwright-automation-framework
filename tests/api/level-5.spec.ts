// LEVEL 5 — the enterprise version of Level 4, using a FIXTURE.
// The `newUser` fixture creates a user before this test and deletes it after,
// all on its own. The test just asks for `newUser` and uses it.
//
// Watch the console order:
//   1. FIXTURE create   (setup, before the test)
//   2. GET all users    (our test body)
//   3. GET one user     (our test body)
//   4. FIXTURE delete   (teardown, after the test)

import { test, expect } from './fixtures';   // 👈 our custom fixture, not @playwright/test
import { apiStep } from './logStep';

const BASE = 'https://gorest.co.in/public/v2';

test('level 5 - list ids + use a fixture-made user', async ({ request, newUser }) => {
  // 1) GET all users on page 1 and SHOW their ids
  const listUrl = `${BASE}/users`;
  const listRes = await request.get(listUrl);
  const users = await apiStep({
    label: 'GET all users (page 1)',
    method: 'GET',
    url: listUrl,
    res: listRes,
    expectStatus: 200,
  });
  const ids = (users as { id: number }[]).map((u) => u.id);
  console.log('🆔 ids on this page:', ids);
  // NOTE: GoRest has thousands of users — this is only PAGE 1 (10 rows).
  //       Add ?page=2 or ?per_page=50 to see more.
  expect(ids.length).toBeGreaterThan(0);

  // 2) GET the specific user the FIXTURE created for us
  const oneUrl = `${BASE}/users/${newUser.id}`;
  const oneRes = await request.get(oneUrl);
  const one = await apiStep({
    label: 'GET the fixture-made user',
    method: 'GET',
    url: oneUrl,
    res: oneRes,
    expectStatus: 200,
  });

  // extra validation: it's really the user the fixture made
  expect((one as { email: string }).email).toBe(newUser.email);
  console.log('✅ fixture user matches:', newUser.email);
});
