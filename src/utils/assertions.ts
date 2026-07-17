import { expect } from '@playwright/test';
import type { ZodType } from 'zod';

/**
 * Contract assertion: validate a response body against a Zod schema.
 * On failure, prints the exact field-level issues — not just "expected object".
 * Returns the parsed, fully-typed value for further assertions.
 */
export function expectSchema<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  expect(
    result.success,
    result.success ? undefined : `Schema validation failed:\n${JSON.stringify(result.error?.issues, null, 2)}`,
  ).toBeTruthy();
  return (result as { data: T }).data;
}

/** Assert GoRest pagination headers are present and coherent. */
export function expectPaginationHeaders(headers: Record<string, string>): void {
  expect(headers['x-pagination-total'], 'x-pagination-total header').toBeDefined();
  expect(headers['x-pagination-pages'], 'x-pagination-pages header').toBeDefined();
  expect(headers['x-pagination-page'], 'x-pagination-page header').toBeDefined();
  expect(headers['x-pagination-limit'], 'x-pagination-limit header').toBeDefined();
}
