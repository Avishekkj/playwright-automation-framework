import { test, expect } from '../../src/fixtures/apiFixtures';
import { validationErrorSchema, type ValidationError } from '../../src/schemas/user.schema';
import { buildUser } from '../../src/utils/dataFactory';
import { invalidUserCases } from '../../src/data/invalidUsers';
import { expectSchema } from '../../src/utils/assertions';

test.describe('Users API — negative & edge cases', () => {
  test('unauthenticated create is rejected with 401', { tag: ['@negative'] }, async ({ anonUsers }) => {
    const res = await anonUsers.create(buildUser());
    expect(res.status).toBe(401);
  });

  test('reading a non-existent user returns 404', { tag: ['@negative'] }, async ({ users }) => {
    const res = await users.getById(999_999_999);
    expect(res.status).toBe(404);
  });

  test('duplicate email is rejected with 422', { tag: ['@negative'] }, async ({ users }) => {
    const payload = buildUser();
    const first = await users.create(payload);
    expect(first.status).toBe(201);
    const id = (first.body as { id: number }).id;

    const dup = await users.create(payload); // same email
    expect(dup.status).toBe(422);
    const errors = expectSchema(validationErrorSchema, dup.body) as ValidationError;
    expect(errors.some((e) => e.field === 'email')).toBeTruthy();

    await users.delete(id); // cleanup
  });

  // DATA-DRIVEN: one test generated per invalid payload.
  for (const c of invalidUserCases) {
    test(`rejects invalid payload: ${c.name}`, { tag: ['@negative'] }, async ({ users }) => {
      const res = await users.create(c.payload as never);
      expect(res.status).toBe(422);
      const errors = expectSchema(validationErrorSchema, res.body) as ValidationError;
      expect(
        errors.some((e) => e.field === c.expectField),
        `expected a validation error on field "${c.expectField}"`,
      ).toBeTruthy();
    });
  }
});
