// JobTitleApi.ts
// A small HELPER that knows how to talk to the "Job Titles" part of the app.
// It has NO tests in it — it only performs actions (list / get / create / update
// / delete). Every action is automatically logged-in, because the "caller" it is
// given already carries the saved session (see fixtures.ts).
//
// This mirrors ZenithHrApi.ts on purpose — copy this shape for the next endpoint.

import type { APIRequestContext, APIResponse } from '@playwright/test';

// where the Job Titles API lives (added onto the site's base URL)
const JOB_TITLES = '/web/index.php/api/v2/admin/job-titles';

// the data we SEND when creating or updating a job title
export interface JobTitleInput {
  title: string;
  description?: string;
  note?: string;
}

// a tidy result every method returns: the status number + the parsed body
export interface ApiResult<T> {
  status: number;
  body: T;
}

export class JobTitleApi {
  // remember the already-logged-in "caller" we were handed
  constructor(private readonly request: APIRequestContext) {}

  // read the response safely and package it as { status, body }
  private async wrap<T>(res: APIResponse): Promise<ApiResult<T>> {
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text; // not JSON (rare) — keep the raw text
      }
    }
    return { status: res.status(), body: body as T };
  }

  // GET — all job titles
  async list(params: Record<string, string | number> = {}) {
    console.log('   → [API] GET  list of job titles');
    return this.wrap<{ data: unknown[]; meta: Record<string, unknown> }>(
      await this.request.get(JOB_TITLES, { params }),
    );
  }

  // GET — one job title by id
  async getById(id: number) {
    console.log(`   → [API] GET  job title id=${id}`);
    return this.wrap<{ data: { id: number; title: string } }>(
      await this.request.get(`${JOB_TITLES}/${id}`),
    );
  }

  // POST — create a new job title
  async create(data: JobTitleInput) {
    console.log(`   → [API] POST create job title "${data.title ?? '(no title)'}"`);
    return this.wrap<{ data: { id: number; title: string } }>(
      await this.request.post(JOB_TITLES, { data }),
    );
  }

  // PUT — update an existing job title
  async update(id: number, data: JobTitleInput) {
    console.log(`   → [API] PUT  update job title id=${id} -> "${data.title}"`);
    return this.wrap<{ data: { id: number; title: string } }>(
      await this.request.put(`${JOB_TITLES}/${id}`, { data }),
    );
  }

  // DELETE — remove a job title
  async delete(id: number) {
    console.log(`   → [API] DEL  job title id=${id}`);
    return this.wrap<{ data: string[] }>(
      await this.request.delete(JOB_TITLES, { data: { ids: [id] } }),
    );
  }
}
