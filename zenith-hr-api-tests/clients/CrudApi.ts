// CrudApi.ts — ONE helper that works for any simple "reference data" endpoint
// (pay grades, employment statuses, job categories, work shifts, ...).
// Instead of copy-pasting a near-identical client per endpoint, we build ONE and
// tell it which URL + friendly name to use. Same idea as JobTitleApi, just reused.

import type { APIRequestContext, APIResponse } from '@playwright/test';
import { log } from '../utils/logger';

export interface ApiResult<T> {
  status: number;
  body: T;
}

export class CrudApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly path: string, // e.g. /web/index.php/api/v2/admin/pay-grades
    private readonly label: string, // e.g. "pay grade" (for the logs)
  ) {}

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

  async list(params: Record<string, string | number> = {}) {
    log.api(`GET  list ${this.label}s`);
    return this.wrap<{ data: unknown[]; meta: Record<string, unknown> }>(
      await this.request.get(this.path, { params }),
    );
  }

  async getById(id: number) {
    log.api(`GET  ${this.label} id=${id}`);
    return this.wrap<{ data: { id: number; name: string } }>(
      await this.request.get(`${this.path}/${id}`),
    );
  }

  // data is a plain object — {name} for simple endpoints, or the fuller
  // work-shift payload. The client doesn't care about the shape; the test does.
  async create(data: Record<string, unknown>) {
    log.api(`POST create ${this.label}`);
    return this.wrap<{ data: { id: number; name: string } }>(
      await this.request.post(this.path, { data }),
    );
  }

  async update(id: number, data: Record<string, unknown>) {
    log.api(`PUT  update ${this.label} id=${id}`);
    return this.wrap<{ data: { id: number; name: string } }>(
      await this.request.put(`${this.path}/${id}`, { data }),
    );
  }

  async delete(id: number) {
    log.api(`DEL  ${this.label} id=${id}`);
    return this.wrap<{ data: string[] }>(
      await this.request.delete(this.path, { data: { ids: [id] } }),
    );
  }
}
