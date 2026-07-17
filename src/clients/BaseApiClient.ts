import type { APIRequestContext, APIResponse } from '@playwright/test';

/** Normalised result every client method returns — status, headers, typed body. */
export interface ApiResult<T> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
  raw: APIResponse;
}

/**
 * Base for all resource clients. Wraps an APIRequestContext so tests never
 * touch `request` directly — they call semantic methods (users.create(), etc).
 * The context already carries baseURL + auth (set in playwright.config.ts).
 */
export abstract class BaseApiClient {
  protected constructor(
    protected readonly request: APIRequestContext,
    protected readonly basePath: string = '',
  ) {}

  /** Build a path under this resource's base, e.g. this.path('/1') -> '/users/1'. */
  protected path(suffix = ''): string {
    return `${this.basePath}${suffix}`;
  }

  /** Convert a raw Playwright response into a typed ApiResult (safe JSON parse). */
  protected async wrap<T>(res: APIResponse): Promise<ApiResult<T>> {
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return {
      status: res.status(),
      ok: res.ok(),
      headers: res.headers(),
      body: body as T,
      raw: res,
    };
  }
}
