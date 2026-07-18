import { test, expect } from '../../src/fixtures/apiFixtures';
import { userSchema, type User } from '../../src/schemas/user.schema';
import { buildUser } from '../../src/utils/dataFactory';
import { expectSchema } from '../../src/utils/assertions';
import { feature, severity, step } from 'allure-js-commons';

/**
 * Full CRUD lifecycle, chaining the id — now wrapped in Allure STEPS so the
 * report shows each phase (Create/Read/Update/Delete) as its own tree node.
 */
test.describe('Users API — CRUD lifecycle', () => {
  test.beforeEach(async () => {
    await feature('Users');       // groups this test under the "Users" feature
    await severity('critical');   // CRUD is a critical path
  });

  test('create, read, update, delete a user', { tag: ['@regression'] }, async ({ users }) => {
    const payload = buildUser({ status: 'active' });

    // each step() shows up as a named node in the Allure report
    const id = await step('Create user', async () => {
      const created = await users.create(payload);
      expect(created.status, 'create returns 201').toBe(201);
      const user = expectSchema(userSchema, created.body);
      expect(user.email).toBe(payload.email);
      return user.id;               // steps can RETURN a value for later steps
    });

    await step('Read the user back', async () => {
      const fetched = await users.getById(id);
      expect(fetched.status).toBe(200);
      expect((fetched.body as User).id).toBe(id);
    });

    await step('Update (PATCH) the user', async () => {
      const updated = await users.update(id, { status: 'inactive', name: 'Updated Name' });
      expect(updated.status).toBe(200);
      expect((updated.body as User).status).toBe('inactive');
      expect((updated.body as User).name).toBe('Updated Name');
    });

    await step('Delete the user', async () => {
      const deleted = await users.delete(id);
      expect(deleted.status, 'delete returns 204').toBe(204);
    });

    await step('Confirm the user is gone (404)', async () => {
      const gone = await users.getById(id);
      expect(gone.status, 'reading a deleted user returns 404').toBe(404);
    });
  });
});
