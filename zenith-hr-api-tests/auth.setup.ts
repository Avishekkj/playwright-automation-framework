// API LOGIN (no browser) — CSRF + session-cookie flow, saved to storageState.
// Runs once as the 'setup' project; the API tests reuse the saved session.
//   GET /auth/login   -> CSRF _token (+ session cookie)
//   POST /auth/validate (token + creds) -> session becomes AUTHENTICATED
//   save storageState -> reused by the API fixture (and the UI later)

import { test as setup, expect } from '@playwright/test';
import { BASE_URL, AUTH_FILE, ADMIN_USERNAME, ADMIN_PASSWORD } from './env';
import { log } from './utils/logger';

setup('API login → save storageState', async ({ playwright }) => {
  // one request context — it keeps cookies between the GET and the POST
  const ctx = await playwright.request.newContext({ baseURL: BASE_URL });

  // 1. load the login page and pull the CSRF token out of the HTML
  log.step(1, 'GET login page and extract the CSRF token');
  const html = await (await ctx.get('/web/index.php/auth/login')).text();
  const token = html.match(/:token="&quot;([^&]+)/)?.[1];
  expect(token, 'CSRF token found on the login page').toBeTruthy();

  // 2. submit credentials + token (form-encoded). ADMIN_PASSWORD is decrypted
  //    from ADMIN_PASSWORD_ENC when configured — never a plaintext literal here.
  log.step(2, `POST /auth/validate as "${ADMIN_USERNAME}" (password from secret vault)`);
  const res = await ctx.post('/web/index.php/auth/validate', {
    form: { _token: token!, username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  });
  expect(res.ok(), 'login POST succeeded').toBeTruthy();

  // 3. prove the session is authenticated
  log.step(3, 'Verify the session is authenticated (GET admin/users → 200)');
  const check = await ctx.get('/web/index.php/api/v2/admin/users?limit=1');
  expect(check.status(), 'session is authenticated').toBe(200);

  // 4. persist the session (cookies) for the API tests to reuse
  log.step(4, `Save storageState → ${AUTH_FILE}`);
  await ctx.storageState({ path: AUTH_FILE });
  await ctx.dispose();
  log.pass('API login complete — session saved');
});
