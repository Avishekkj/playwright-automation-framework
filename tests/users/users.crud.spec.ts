import { test, expect } from '../../src/fixtures/apiFixtures';
import { userSchema, type User } from '../../src/schemas/user.schema';
import { buildUser } from '../../src/utils/dataFactory';
import { expectSchema } from '../../src/utils/assertions';

/**
 * Full CRUD lifecycle in ONE flow, chaining the id between steps:
 * Create -> Read -> Update -> Delete -> confirm 404.
 */
test.describe('Users API — CRUD lifecycle', () => {
  test('create, read, update, delete a user', { tag: ['@regression'] }, async ({ users }) => {
    // CREATE
    const payload = buildUser({ status: 'active' });
    const created = await users.create(payload);
    expect(created.status, 'create returns 201').toBe(201);
    const user = expectSchema(userSchema, created.body);
    expect(user.email).toBe(payload.email);
    const id = user.id;

    // READ
    const fetched = await users.getById(id);
    expect(fetched.status).toBe(200);
    expect((fetched.body as User).id).toBe(id);

    // UPDATE (PATCH) — flip status and change name
    const updated = await users.update(id, { status: 'inactive', name: 'Updated Name' });
    expect(updated.status).toBe(200);
    expect((updated.body as User).status).toBe('inactive');
    expect((updated.body as User).name).toBe('Updated Name');

    // DELETE
    const deleted = await users.delete(id);
    expect(deleted.status, 'delete returns 204').toBe(204);

    // CONFIRM GONE
    const gone = await users.getById(id);
    expect(gone.status, 'reading a deleted user returns 404').toBe(404);
  });
});
