import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiResult } from './BaseApiClient';
import type { User, UserInput, ValidationError } from '../schemas/user.schema';

export interface ListParams {
  page?: number;
  per_page?: number;
  name?: string;
  status?: 'active' | 'inactive';
}

/** Service layer for the /users resource. */
export class UsersApi extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, 'users');
  }

  async list(params: ListParams = {}): Promise<ApiResult<User[]>> {
    const res = await this.request.get(this.path(), { params: { ...params } });
    return this.wrap<User[]>(res);
  }

  async getById(id: number): Promise<ApiResult<User>> {
    const res = await this.request.get(this.path(`/${id}`));
    return this.wrap<User>(res);
  }

  /** Create — returns User on 201, or ValidationError[] on 422. */
  async create(data: UserInput): Promise<ApiResult<User | ValidationError>> {
    const res = await this.request.post(this.path(), { data });
    return this.wrap<User | ValidationError>(res);
  }

  async update(id: number, data: Partial<UserInput>): Promise<ApiResult<User | ValidationError>> {
    const res = await this.request.patch(this.path(`/${id}`), { data });
    return this.wrap<User | ValidationError>(res);
  }

  async delete(id: number): Promise<ApiResult<null>> {
    const res = await this.request.delete(this.path(`/${id}`));
    return this.wrap<null>(res);
  }
}
