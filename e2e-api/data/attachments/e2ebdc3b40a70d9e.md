# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> API login → save storageState
- Location: zenith-hr-api-tests/auth.setup.ts:11:1

# Error details

```
Error: session is authenticated

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Test source

```ts
  1  | // API LOGIN (no browser) — CSRF + session-cookie flow, saved to storageState.
  2  | // Runs once as the 'setup' project; the API tests reuse the saved session.
  3  | //   GET /auth/login   -> CSRF _token (+ session cookie)
  4  | //   POST /auth/validate (token + creds) -> session becomes AUTHENTICATED
  5  | //   save storageState -> reused by the API fixture (and the UI later)
  6  | 
  7  | import { test as setup, expect } from '@playwright/test';
  8  | import { BASE_URL, AUTH_FILE, ADMIN_USERNAME, ADMIN_PASSWORD } from './env';
  9  | import { log } from './utils/logger';
  10 | 
  11 | setup('API login → save storageState', async ({ playwright }) => {
  12 |   // one request context — it keeps cookies between the GET and the POST
  13 |   const ctx = await playwright.request.newContext({ baseURL: BASE_URL });
  14 | 
  15 |   // 1. load the login page and pull the CSRF token out of the HTML
  16 |   log.step(1, 'GET login page and extract the CSRF token');
  17 |   const html = await (await ctx.get('/web/index.php/auth/login')).text();
  18 |   const token = html.match(/:token="&quot;([^&]+)/)?.[1];
  19 |   expect(token, 'CSRF token found on the login page').toBeTruthy();
  20 | 
  21 |   // 2. submit credentials + token (form-encoded). ADMIN_PASSWORD is decrypted
  22 |   //    from ADMIN_PASSWORD_ENC when configured — never a plaintext literal here.
  23 |   log.step(2, `POST /auth/validate as "${ADMIN_USERNAME}" (password from secret vault)`);
  24 |   const res = await ctx.post('/web/index.php/auth/validate', {
  25 |     form: { _token: token!, username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  26 |   });
  27 |   expect(res.ok(), 'login POST succeeded').toBeTruthy();
  28 | 
  29 |   // 3. prove the session is authenticated
  30 |   log.step(3, 'Verify the session is authenticated (GET admin/users → 200)');
  31 |   const check = await ctx.get('/web/index.php/api/v2/admin/users?limit=1');
> 32 |   expect(check.status(), 'session is authenticated').toBe(200);
     |                                                      ^ Error: session is authenticated
  33 | 
  34 |   // 4. persist the session (cookies) for the API tests to reuse
  35 |   log.step(4, `Save storageState → ${AUTH_FILE}`);
  36 |   await ctx.storageState({ path: AUTH_FILE });
  37 |   await ctx.dispose();
  38 |   log.pass('API login complete — session saved');
  39 | });
  40 | 
```