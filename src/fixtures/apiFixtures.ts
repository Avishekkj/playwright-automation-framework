import { test as base, expect } from '@playwright/test';
import { UsersApi } from '../clients/UsersApi';
import { PostsApi } from '../clients/PostsApi';
import { env } from '../config/env';
import { buildUser } from '../utils/dataFactory';
import type { User } from '../schemas/user.schema';

/**
 * Custom fixtures — the backbone of the framework.
 * Tests declare what they need; setup/teardown is automatic.
 *
 *  users / posts : authed service clients (token from config).
 *  anonUsers     : an UNauthenticated client, for testing 401s.
 *  testUser      : creates a real user before the test, deletes it after.
 */
type ApiFixtures = {
  users: UsersApi;
  posts: PostsApi;
  anonUsers: UsersApi;
  testUser: User;
};

export const test = base.extend<ApiFixtures>({
  users: async ({ request }, use) => {
    await use(new UsersApi(request));
  },

  posts: async ({ request }, use) => {
    await use(new PostsApi(request));
  },

  anonUsers: async ({ playwright }, use) => {
    // Fresh context with NO Authorization header — used to prove writes need auth.
    const ctx = await playwright.request.newContext({
      baseURL: env.baseUrl,
      extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    await use(new UsersApi(ctx));
    await ctx.dispose();
  },

  testUser: async ({ users }, use) => {
    const created = await users.create(buildUser());
    expect(created.status, 'precondition: test user created').toBe(201);
    const user = created.body as User;

    await use(user);

    // Teardown — always clean up so we never leave orphaned records.
    await users.delete(user.id);
  },
});

export { expect };
