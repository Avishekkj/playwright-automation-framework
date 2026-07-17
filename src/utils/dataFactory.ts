import { faker } from '@faker-js/faker';
import type { UserInput } from '../schemas/user.schema';
import type { PostInput, CommentInput } from '../schemas/post.schema';

/**
 * Test-data builders. Every user gets a UNIQUE email (GoRest rejects duplicates
 * with 422), so tests never collide even when run in parallel.
 */
export function buildUser(overrides: Partial<UserInput> = {}): UserInput {
  const unique = `${Date.now()}${faker.number.int({ min: 1000, max: 9999 })}`;
  return {
    name: faker.person.fullName(),
    email: `qa.${unique}@gorest-test.com`,
    gender: faker.helpers.arrayElement(['male', 'female']),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    ...overrides,
  };
}

export function buildPost(overrides: Partial<PostInput> = {}): PostInput {
  return {
    title: faker.lorem.sentence(5),
    body: faker.lorem.paragraph(2),
    ...overrides,
  };
}

export function buildComment(overrides: Partial<CommentInput> = {}): CommentInput {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    body: faker.lorem.sentence(8),
    ...overrides,
  };
}
