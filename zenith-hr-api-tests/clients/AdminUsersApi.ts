// AdminUsersApi — helper for the Admin → User Management (system users) API.
// A user links an employee to a role (Admin = 1, ESS = 2).

import type { APIRequestContext, APIResponse } from '@playwright/test';
import { log } from '../utils/logger';

const USERS = '/web/index.php/api/v2/admin/users';

export interface UserInput {
  username: string;
  password: string;
  status: boolean; // true = enabled
  userRoleId: number; // 1 = Admin, 2 = ESS
  empNumber: number; // the employee this user is for
}

export interface ApiResult<T> {
  status: number;
  body: T;
}

export class AdminUsersApi {
  constructor(private readonly request: APIRequestContext) {}

  private async wrap<T>(res: APIResponse): Promise<ApiResult<T>> {
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: res.status(), body: body as T };
  }

  async listUsers(params: Record<string, string | number> = {}) {
    log.api('GET  list users');
    return this.wrap<{ data: unknown[]; meta: Record<string, unknown> }>(
      await this.request.get(USERS, { params }),
    );
  }

  async getUser(id: number) {
    log.api(`GET  user id=${id}`);
    return this.wrap<{ data: { id: number; userName: string } }>(
      await this.request.get(`${USERS}/${id}`),
    );
  }

  async createUser(data: UserInput) {
    log.api(`POST create user "${data.username}"`);
    return this.wrap<{ data: { id: number; userName: string } }>(
      await this.request.post(USERS, { data }),
    );
  }

  async deleteUser(id: number) {
    log.api(`DEL  user id=${id}`);
    return this.wrap<{ data: string[] }>(
      await this.request.delete(USERS, { data: { ids: [id] } }),
    );
  }
}
