// Service client for the Zenith HR (OrangeHRM) api/v2 employees endpoints.
// Tests call methods, not raw HTTP. Auth = the session cookie carried by the
// APIRequestContext (loaded from storageState).

import type { APIRequestContext, APIResponse } from '@playwright/test';

const EMPLOYEES = '/web/index.php/api/v2/pim/employees';

export interface EmployeeInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
}

// api/v2 wraps every payload in { data, meta, rels }
export interface ApiResult<T> {
  status: number;
  body: T;
}

export class ZenithHrApi {
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

  async listEmployees(params: Record<string, string | number> = {}) {
    return this.wrap<{ data: unknown[]; meta: Record<string, unknown> }>(
      await this.request.get(EMPLOYEES, { params }),
    );
  }

  async createEmployee(data: EmployeeInput) {
    return this.wrap<{ data: { empNumber: number; employeeId: string; firstName: string; lastName: string } }>(
      await this.request.post(EMPLOYEES, { data }),
    );
  }

  async getEmployee(empNumber: number) {
    return this.wrap<{ data: { empNumber: number } }>(
      await this.request.get(`${EMPLOYEES}/${empNumber}`),
    );
  }

  async deleteEmployee(empNumber: number) {
    return this.wrap<{ data: string[] }>(
      await this.request.delete(EMPLOYEES, { data: { ids: [empNumber] } }),
    );
  }
}
