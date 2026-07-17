// LEVEL 9 — SCHEMA (contract) validation with Zod.
// Status checks say "did it respond?". Value checks say "is this field right?".
// SCHEMA checks say "is the whole SHAPE correct?" — every field, every type.
// This catches the sneaky bug: the API silently changes id from number -> string,
// or drops a field. Status is still 200, but the contract is broken.

import { test, expect } from './fixtures';   // gives us the newUser fixture + expect
import { z } from 'zod';                      // the schema library
import { apiStep } from './logStep';

const BASE = 'https://gorest.co.in/public/v2';

// ---- THE CONTRACT: what a GoRest user MUST look like ----
// 🔤 z.object({...})  = describe an object's shape, field by field, with types.
const userSchema = z.object({
  id: z.number(),                          // must be a NUMBER
  name: z.string(),                        // must be a string
  email: z.string().email(),               // must be a string that IS an email
  gender: z.enum(['male', 'female']),      // must be one of these two
  status: z.enum(['active', 'inactive']),  // must be one of these two
});

// 🔤 z.array(schema) = "a list where EVERY item matches userSchema".
const userListSchema = z.array(userSchema);

test.describe('Level 9 - schema (contract) validation', () => {

  // ---- 1. the whole LIST matches the contract ----
  test('user list matches the schema', { tag: ['@schema'] }, async ({ request }) => {
    const url = `${BASE}/users`;
    const res = await request.get(url);
    const body = await apiStep({ label: 'GET users list', method: 'GET', url, res, expectStatus: 200 });

    // 🔤 safeParse = validate WITHOUT throwing. Returns { success, data | error }.
    const result = userListSchema.safeParse(body);
    if (!result.success) console.log('SCHEMA ISSUES:', result.error.issues);
    expect(result.success, 'every user in the list must match the schema').toBe(true);
  });

  // ---- 2. a single (fixture-made) user matches the contract ----
  test('single user matches the schema', { tag: ['@schema'] }, async ({ request, newUser }) => {
    const url = `${BASE}/users/${newUser.id}`;
    const res = await request.get(url);
    const body = await apiStep({ label: 'GET one user', method: 'GET', url, res, expectStatus: 200 });

    const result = userSchema.safeParse(body);
    if (!result.success) console.log('SCHEMA ISSUES:', result.error.issues);
    expect(result.success).toBe(true);
  });

  // ---- 3. PROVE the schema CATCHES a broken contract ----
  // We take a REAL user and tamper it (turn id into a string), simulating the
  // API silently changing a field type. The schema must reject it.
  test('schema catches a broken contract', { tag: ['@schema'] }, async ({ request }) => {
    const res = await request.get(`${BASE}/users`);
    const users = (await res.json()) as { id: number }[];

    // tamper: id becomes a STRING instead of a number
    const broken = { ...users[0], id: String(users[0].id) };
    console.log('tampered object:', broken);

    const result = userSchema.safeParse(broken);

    // we EXPECT validation to FAIL...
    expect(result.success, 'a string id must be rejected').toBe(false);

    // ...and to point specifically at the "id" field.
    const idIssues = result.success ? [] : result.error.issues.filter((i) => i.path.includes('id'));
    expect(idIssues.length, 'the error should be about "id"').toBeGreaterThan(0);
    console.log('✅ schema correctly caught the bad id type:', idIssues[0]?.message);
  });
});
