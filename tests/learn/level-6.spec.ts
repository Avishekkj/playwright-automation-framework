// LEVEL 6 — DATA-DRIVEN testing.
// Big idea: keep the test LOGIC in one place, and the test DATA in a list.
// A loop then generates ONE test per item. Add a row -> get a new test for free.
//
// We cover the full practice list in two data-driven suites:
//   6a) every HTTP method:  GET, POST, PUT, PATCH, DELETE
//   6b) every status code:  200,201,204,400,401,403,404,409,429,500
// Both run against httpbingo.org (a reliable request/response echo service).

import { test } from '@playwright/test';
import { apiStep } from './logStep';

const BASE = 'https://httpbingo.org';

// ===========================================================================
// 6a — EVERY HTTP METHOD  (data-driven over a list of methods)
// ===========================================================================

// 🔤 the DATA: just an array of method names.
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

test.describe('Level 6a - every HTTP method', () => {
  // 🔤 for (const m of methods)  = loop over each method name.
  //    This loop runs when Playwright COLLECTS tests, so each pass REGISTERS a test.
  for (const method of methods) {
    test(`${method} request works`, async ({ request }) => {
      // httpbingo has /get, /post, /put, /patch, /delete — all return 200.
      const url = `${BASE}/${method.toLowerCase()}`;

      // 🔤 request.fetch(url, { method })  = generic call where WE pass the method.
      //    (request.get/post/... are shortcuts; fetch lets the method be dynamic.)
      const res = await request.fetch(url, { method });

      await apiStep({ label: `${method} ${url}`, method, url, res, expectStatus: 200 });
    });
  }
});

// ===========================================================================
// 6b — EVERY STATUS CODE  (data-driven over a list of {code, meaning})
// ===========================================================================

// 🔤 the DATA: a list of objects, each = one status code + its meaning.
const statusCases = [
  { code: 200, meaning: 'OK' },
  { code: 201, meaning: 'Created' },
  { code: 204, meaning: 'No Content' },
  { code: 400, meaning: 'Bad Request' },
  { code: 401, meaning: 'Unauthorized' },
  { code: 403, meaning: 'Forbidden' },
  { code: 404, meaning: 'Not Found' },
  { code: 409, meaning: 'Conflict' },
  { code: 429, meaning: 'Too Many Requests' },
  { code: 500, meaning: 'Server Error' },
];

test.describe('Level 6b - every status code', () => {
  // 🔤 { code, meaning }  = DESTRUCTURE each object right in the loop header.
  for (const { code, meaning } of statusCases) {
    test(`${code} ${meaning}`, async ({ request }) => {
      // httpbingo.org/status/CODE returns exactly that status code on demand.
      const url = `${BASE}/status/${code}`;
      const res = await request.get(url);

      // we EXPECT the same code we asked for. (Playwright doesn't throw on 4xx/5xx,
      // so we can assert on error codes just like success codes.)
      await apiStep({ label: `${code} ${meaning}`, method: 'GET', url, res, expectStatus: code });
    });
  }
});
