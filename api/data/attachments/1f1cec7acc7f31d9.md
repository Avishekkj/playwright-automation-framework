# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/rbac.spec.ts >> Zenith HR API — RBAC (roles & permissions) >> ESS user CAN access their own PIM (200)
- Location: zenith-hr-api-tests/tests/rbac.spec.ts:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: apiRequestContext.get: Request context disposed.
Call log:
  - → GET https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=1
    - user-agent: Playwright/1.61.1 (x64; ubuntu 24.04) node/20.20 CI/1
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - cookie: orangehrm=ahvgav1t78lbfqqj7g2t6ncnkv

```

# Test source

```ts
  1  | // RBAC — roles & permissions.
  2  | // The essRequest fixture creates a fresh ESS user and logs in AS them, so we can
  3  | // prove an ESS user is blocked from admin actions but allowed on their own PIM.
  4  | // The adminUsersApi fixture is our Admin control (should be allowed).
  5  | import { test, expect } from '../fixtures';
  6  | import { log } from '../utils/logger';
  7  | 
  8  | const API = '/web/index.php/api/v2';
  9  | 
  10 | test.describe('Zenith HR API — RBAC (roles & permissions)', () => {
  11 |   test('ESS user is FORBIDDEN from admin endpoints (403)', { tag: ['@authorization'] }, async ({ essRequest }) => {
  12 |     log.step(1, 'ESS user tries to read admin/users');
  13 |     expect((await essRequest.get(`${API}/admin/users?limit=1`)).status()).toBe(403);
  14 | 
  15 |     log.step(2, 'ESS user tries to read admin/job-titles');
  16 |     expect((await essRequest.get(`${API}/admin/job-titles?limit=1`)).status()).toBe(403);
  17 | 
  18 |     log.pass('ESS correctly blocked from admin endpoints');
  19 |   });
  20 | 
  21 |   test('ESS user CAN access their own PIM (200)', { tag: ['@authorization'] }, async ({ essRequest }) => {
  22 |     log.step(1, 'ESS user reads pim/employees');
> 23 |     expect((await essRequest.get(`${API}/pim/employees?limit=1`)).status()).toBe(200);
     |                              ^ Error: apiRequestContext.get: Request context disposed.
  24 |     log.pass('ESS allowed on PIM');
  25 |   });
  26 | 
  27 |   test('Admin CAN access admin endpoints (200) — control', { tag: ['@authorization'] }, async ({ adminUsersApi }) => {
  28 |     log.step(1, 'Admin lists users');
  29 |     expect((await adminUsersApi.listUsers({ limit: 1 })).status).toBe(200);
  30 |     log.pass('Admin allowed on admin endpoints');
  31 |   });
  32 | });
  33 | 
```