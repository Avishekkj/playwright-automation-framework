// ============================================================================
// fixtures.ts — a CUSTOM fixture "newUser" (setup before test, cleanup after).
// Comments marked 🔤 explain the SYNTAX (the grammar), not just the meaning.
// ============================================================================

import { test as base } from '@playwright/test';
// 🔤 import { X } from '...'   = "named import" — grab the thing literally named X.
// 🔤 { test as base }         = "as" RENAMES it. We import `test` but call it `base`.
//    (We rename because we'll build our OWN `test` on top of it below.)

import { env } from '../../src/config/env';
// 🔤 '../../'  = go UP two folders, then into src/config/env. A relative file path.

import { apiStep } from './logStep';
// 🔤 './'  = "same folder as this file". So logStep.ts sits right next to us.

const BASE = 'https://gorest.co.in/public/v2';
// 🔤 const NAME = value   = declare a constant (can't be reassigned). A plain string.

const AUTH = { Authorization: `Bearer ${env.token}` };
// 🔤 { key: value }        = an OBJECT literal. Here one key: "Authorization".
// 🔤 `...${env.token}...`   = a TEMPLATE STRING (backticks). ${...} drops a value in.
//    Result: "Bearer 43c0..." (the word Bearer, a space, then the token).

type LearnFixtures = {
  newUser: { id: number; email: string };
};
// 🔤 type NAME = {...}      = a TypeScript TYPE alias. It DESCRIBES a shape; it makes
//    no code, it just tells TS "newUser is an object with a number id + string email".

export const test = base.extend<LearnFixtures>({
  // 🔤 export            = make `test` importable by other files.
  // 🔤 base.extend(...)  = call the `extend` method on base to add our fixtures.
  // 🔤 <LearnFixtures>   = a GENERIC — tells extend the shape of what we're adding.
  // 🔤 ({ ... })         = extend takes ONE argument: an object of fixtures.

  newUser: async ({ request }, use) => {
    // 🔤 newUser: <fn>        = an object property whose VALUE is a function.
    // 🔤 async                = this function does "awaiting" (network calls).
    // 🔤 ({ request }, use)   = the function's TWO parameters:
    //      • { request }  → DESTRUCTURING: pull the `request` fixture out for us.
    //      • use          → the "doorway" we call to hand a value to the test.
    // 🔤 => { ... }           = an ARROW FUNCTION. "=>" means "goes to / does".

    // ----- SETUP (above `use`) -----

    const email = `qa_${Date.now()}@test.com`;
    // 🔤 Date.now()  = a built-in that returns the current time as a number.
    //    Used inside `${}` to make the email unique every run.

    const url = `${BASE}/users`;
    // 🔤 combine strings with a template: BASE + "/users".

    const res = await request.post(url, {
      headers: AUTH,
      data: { name: 'Test User', email, gender: 'male', status: 'active' },
    });
    // 🔤 await                = "wait for this network call to finish, then continue".
    // 🔤 request.post(a, b)   = call post with 2 args: the url, and an options object.
    // 🔤 { headers, data }    = options: headers (our token) + data (the body we send).
    // 🔤 { name, email, ... } = the new user. Note `email` alone is SHORTHAND for
    //                          `email: email` (key name same as the variable).

    const body = await apiStep({
      label: 'FIXTURE setup — create user',
      method: 'POST',
      url,
      res,
      expectStatus: 201,
    });
    // 🔤 apiStep({...})  = call our helper with ONE object argument (named options).
    // 🔤 url, res        = more shorthand: `url: url`, `res: res`.

    const id = (body as { id: number }).id;
    // 🔤 (body as { id: number })  = a TYPE ASSERTION. "Trust me TS, body has an id."
    // 🔤 .id                       = then read the id property off it.

    // ----- HANDOFF -----
    await use({ id, email });
    // 🔤 use(value)  = hand `value` to the test. Code PAUSES here, the test runs,
    //                 then RESUMES on the next line after the test finishes.
    // 🔤 { id, email } = shorthand object = { id: id, email: email }.

    // ----- TEARDOWN (below `use`, runs AFTER the test, even if it failed) -----

    const delUrl = `${BASE}/users/${id}`;
    // 🔤 put the id into the URL: .../users/8542289

    const delRes = await request.delete(delUrl, { headers: AUTH });
    // 🔤 request.delete(url, options)  = same call shape as post, but no body needed.

    await apiStep({
      label: 'FIXTURE teardown — delete user',
      method: 'DELETE',
      url: delUrl,
      res: delRes,
      expectStatus: 204,
    });
  },
});

export { expect } from '@playwright/test';
// 🔤 export { X } from '...'  = re-export. Pass `expect` straight through so test
//    files can do:  import { test, expect } from './fixtures';  (both from one place)
