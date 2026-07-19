// apiLogin — logs in via the API (CSRF + session) and returns an authenticated
// request context. Used to log in AS a specific user (e.g. an ESS user for RBAC).

import type { APIRequest, APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../env';

export async function apiLogin(
  pwRequest: APIRequest,
  username: string,
  password: string,
): Promise<APIRequestContext> {
  const ctx = await pwRequest.newContext({ baseURL: BASE_URL });

  // 1. get the CSRF token from the login page (cookie is stored in ctx)
  const html = await (await ctx.get('/web/index.php/auth/login')).text();
  const token = html.match(/:token="&quot;([^&]+)/)?.[1] ?? '';

  // 2. submit credentials -> the session becomes authenticated
  await ctx.post('/web/index.php/auth/validate', {
    form: { _token: token, username, password },
  });

  return ctx; // caller must dispose() it when done
}
