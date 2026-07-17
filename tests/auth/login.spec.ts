// Tools we borrow from Playwright:
//   test   = "here is a test to run"
//   expect = "check this is true, else fail"
//   request(as playwrightRequest) = a way to make API calls (GET/POST...)
import { test, expect, request as playwrightRequest } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test'; // just the TYPE for our api caller
import { env } from '../../src/config/env';                // our settings (base URL etc.)

// describe = a folder/group that holds related tests. Name it for humans.
test.describe('Auth — dynamic JWT login flow (DummyJSON)', () => {
  // "ctx" = our reusable API caller. Declared here so every test can use it.
  let ctx: APIRequestContext;

  // beforeAll = runs ONCE before the tests. Set up the API caller here.
  test.beforeAll(async () => {
    ctx = await playwrightRequest.newContext({
      baseURL: env.dummyBaseUrl,                          // https://dummyjson.com
      extraHTTPHeaders: { 'Content-Type': 'application/json' }, // "we speak JSON"
    });
  });

  // afterAll = runs ONCE after the tests. Clean up (close the caller).
  test.afterAll(async () => {
    await ctx.dispose();
  });

  // ---- TEST 1: log in, get a token, use it ----
  test('login returns a token, then a protected call succeeds', { tag: ['@regression'] }, async () => {
    // 1) Send username + password to the login endpoint (POST)
    const loginRes = await ctx.post('/auth/login', {
      data: { username: 'emilys', password: 'emilyspass' },
    });
    expect(loginRes.status()).toBe(200);                  // 200 = login worked

    // 2) Pull the token out of the reply
    const { accessToken } = (await loginRes.json()) as { accessToken: string };
    expect(accessToken, 'login returns a JWT').toBeTruthy(); // token must exist

    // 3) Call a protected page, showing the token as our "ID card"
    const meRes = await ctx.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` }, // Bearer <token> = "let me in"
    });
    expect(meRes.status()).toBe(200);                     // 200 = token accepted
    expect((await meRes.json()).username).toBe('emilys'); // it's really Emily's data
  });

  // ---- TEST 2: no token = get blocked ----
  test('protected call without a token is rejected', { tag: ['@negative'] }, async () => {
    const res = await ctx.get('/auth/me');                // no ID card this time
    expect(res.status()).toBe(401);                       // 401 = "who are you? denied"
  });
});
