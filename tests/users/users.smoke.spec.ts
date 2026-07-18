import { test, expect } from '../../src/fixtures/apiFixtures';
import { userListSchema } from '../../src/schemas/user.schema';
import { expectSchema, expectPaginationHeaders } from '../../src/utils/assertions';
import { feature, severity } from 'allure-js-commons';

test.describe('Users API — smoke', () => {
  test.beforeEach(async () => {
    await feature('Users');
    await severity('normal');
  });

  test(
    'GET /users returns a valid, paginated list',
    { tag: ['@smoke'] },
    async ({ users }) => {
      const res = await users.list({ page: 1, per_page: 10 });

      expect(res.status).toBe(200);
      expectPaginationHeaders(res.headers);

      // Contract check: the whole list must match the User schema.
      const list = expectSchema(userListSchema, res.body);
      expect(list.length).toBeGreaterThan(0);
      expect(list.length).toBeLessThanOrEqual(10);
    },
  );
});
