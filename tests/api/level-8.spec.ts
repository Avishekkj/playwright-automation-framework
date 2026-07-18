// LEVEL 8 — the "everything" showcase:
//   • HOOKS: beforeAll / afterAll / beforeEach / afterEach (watch the order)
//   • TAGS: @smoke / @regression / @json / @csv  (run subsets with --grep)
//   • ANNOTATIONS: skip, conditional skip, fixme, slow
//   • DATA-DRIVEN from a JSON file AND a CSV file
//
// The data feeds real POSTs to httpbingo (which echoes the body back).

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';          // 🔤 Node's file reader
import { parse } from 'csv-parse/sync';     // 🔤 turns CSV text into objects

const BASE = 'https://httpbingo.org';

// ---- LOAD DATA FROM FILES (runs once, when tests are collected) ----

// 🔤 new URL('./data/users.json', import.meta.url) = path to a file NEXT to this one.
type Row = { name: string; email: string; role: string };
const jsonUsers = JSON.parse(
  readFileSync(new URL('./data/users.json', import.meta.url), 'utf-8'),
) as Row[];

// CSV: read the text, then parse. columns:true = use the header row as keys.
const csvUsers = parse(readFileSync(new URL('./data/users.csv', import.meta.url), 'utf-8'), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as Row[];

test.describe('Level 8 - hooks, tags, annotations, file-driven data', () => {

  // ---- HOOKS: watch the console to see WHEN each runs ----
  test.beforeAll(async () => {
    console.log('╔ beforeAll  — runs ONCE before all tests in this describe');
  });
  test.afterAll(async () => {
    console.log('╚ afterAll   — runs ONCE after all tests finish');
  });
  test.beforeEach(async ({}, testInfo) => {
    console.log(`  ┌ beforeEach — before: ${testInfo.title}`);
  });
  test.afterEach(async ({}, testInfo) => {
    console.log(`  └ afterEach  — after:  ${testInfo.title}  [${testInfo.status}]`);
  });

  // ---- DATA-DRIVEN FROM JSON (tagged @smoke + @json) ----
  for (const u of jsonUsers) {
    test(`JSON row - ${u.name}`, { tag: ['@smoke', '@json'] }, async ({ request }) => {
      const url = `${BASE}/post`;
      const res = await request.post(url, { data: u });
      expect(res.status()).toBe(200);
      const body = JSON.stringify(await res.json());
      // the echo should contain what we sent
      expect(body).toContain(u.email);
      console.log(`    ✓ sent & echoed: ${u.name} (${u.role})`);
    });
  }

  // ---- DATA-DRIVEN FROM CSV (tagged @regression + @csv) ----
  for (const u of csvUsers) {
    test(`CSV row - ${u.name}`, { tag: ['@regression', '@csv'] }, async ({ request }) => {
      const url = `${BASE}/post`;
      const res = await request.post(url, { data: u });
      expect(res.status()).toBe(200);
      expect(JSON.stringify(await res.json())).toContain(u.email);
      console.log(`    ✓ sent & echoed: ${u.name} (${u.role})`);
    });
  }

  // ---- ANNOTATIONS ----

  // (a) always skipped — e.g. feature not built yet.
  test.skip('ANNOTATION skip - not implemented yet', async () => {
    // never runs
  });

  // (b) conditional skip — skip only under a condition (here: never, just a demo).
  test('ANNOTATION conditional skip', async () => {
    test.skip(process.env.CI === 'true', 'skipped only in CI');
    expect(1 + 1).toBe(2);
  });

  // (c) fixme — a known-broken test you plan to fix. Reported, not run.
  test.fixme('ANNOTATION fixme - known bug, fix later', async () => {
    // Playwright shows this as "fixme" and does not run it.
  });

  // (d) slow — triples the timeout for a legitimately slow test.
  test('ANNOTATION slow - needs more time', async ({ request }) => {
    test.slow();
    const res = await request.get(`${BASE}/delay/1`); // httpbingo waits ~1s
    expect(res.status()).toBe(200);
  });
});
