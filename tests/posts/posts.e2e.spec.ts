import { test, expect } from '../../src/fixtures/apiFixtures';
import { postSchema, commentSchema } from '../../src/schemas/post.schema';
import { buildPost, buildComment } from '../../src/utils/dataFactory';
import { expectSchema } from '../../src/utils/assertions';

/**
 * End-to-end business flow across THREE resources, using the `testUser`
 * fixture (auto create + cleanup):
 *   user -> create post for user -> add comment to post -> verify the chain.
 */
test.describe('Posts API — end-to-end journey', () => {
  test('create a post and comment for a user', { tag: ['@regression'] }, async ({ posts, testUser }) => {
    // 1. Post belongs to the fixture-provided user
    const postRes = await posts.createForUser(testUser.id, buildPost());
    expect(postRes.status).toBe(201);
    const post = expectSchema(postSchema, postRes.body);
    expect(post.user_id).toBe(testUser.id); // referential integrity

    // 2. Comment belongs to that post
    const commentRes = await posts.addComment(post.id, buildComment());
    expect(commentRes.status).toBe(201);
    const comment = expectSchema(commentSchema, commentRes.body);
    expect(comment.post_id).toBe(post.id);

    // 3. The comment is retrievable via the post
    const listRes = await posts.listComments(post.id);
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((c) => c.id === comment.id)).toBeTruthy();
  });
});
