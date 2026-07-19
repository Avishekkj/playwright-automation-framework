// API LOGIN (no browser) — CSRF + session-cookie flow, saved to storageState.
// Runs once as the 'setup' project; the API tests reuse the saved session.
//   GET /auth/login   -> CSRF _token (+ session cookie)
//   POST /auth/validate (token + creds) -> session becomes AUTHENTICATED
//   save storageState -> reused by the API fixture (and the UI later)

import { test as setup, expect } from '@playwright/test';
import { BASE_URL, AUTH_FILE } from './env';

setup('API login → save storageState', async ({ playwright }) => {
  // one request context — it keeps cookies between the GET and the POST
  const ctx = await playwright.request.newContext({ baseURL: BASE_URL });

  // 1. load the login page and pull the CSRF token out of the HTML
  const html = await (await ctx.get('/web/index.php/auth/login')).text();
  const token = html.match(/:token="&quot;([^&]+)/)?.[1];
  expect(token, 'CSRF token found on the login page').toBeTruthy();

  // 2. submit credentials + token (form-encoded)
  const res = await ctx.post('/web/index.php/auth/validate', {
    form: { _token: token!, username: 'Admin', password: 'admin123' },
  });
  expect(res.ok(), 'login POST succeeded').toBeTruthy();

  // 3. prove the session is authenticated
  const check = await ctx.get('/web/index.php/api/v2/admin/users?limit=1');
  expect(check.status(), 'session is authenticated').toBe(200);

  // 4. persist the session (cookies) for the API tests to reuse
  await ctx.storageState({ path: AUTH_FILE });
  await ctx.dispose();
});
