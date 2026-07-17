import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiResult } from './BaseApiClient';
import type { Post, PostInput, Comment, CommentInput } from '../schemas/post.schema';

/** Service layer for /posts and the nested /users/{id}/posts + /posts/{id}/comments. */
export class PostsApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, 'posts');
  }

  async getById(id: number): Promise<ApiResult<Post>> {
    const res = await this.request.get(this.path(`/${id}`));
    return this.wrap<Post>(res);
  }

  /** Create a post that belongs to a user (nested resource). */
  async createForUser(userId: number, data: PostInput): Promise<ApiResult<Post>> {
    const res = await this.request.post(`users/${userId}/posts`, { data });
    return this.wrap<Post>(res);
  }

  /** Add a comment to a post (nested resource). */
  async addComment(postId: number, data: CommentInput): Promise<ApiResult<Comment>> {
    const res = await this.request.post(`posts/${postId}/comments`, { data });
    return this.wrap<Comment>(res);
  }

  async listComments(postId: number): Promise<ApiResult<Comment[]>> {
    const res = await this.request.get(`posts/${postId}/comments`);
    return this.wrap<Comment[]>(res);
  }
}
