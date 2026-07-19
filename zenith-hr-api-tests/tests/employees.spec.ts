// Zenith HR API tests — Employees.
// Auth comes from the saved session (auth.setup.ts) via the peopleApi fixture.

import { readFileSync } from 'fs';
import { test, expect } from '../fixtures';
import { employeeSchema } from '../schemas/employee.schema';

// load the dataset from the external JSON file (ESM-safe)
const employees = JSON.parse(
  readFileSync(new URL('../data/employees.json', import.meta.url), 'utf-8'),
) as { firstName: string; lastName: string }[];

test.describe('Zenith HR API — Employees', () => {
  // ── smoke: list returns data + pagination, and matches the schema ──
  test('list employees returns data + pagination', { tag: ['@smoke'] }, async ({ peopleApi }) => {
    const res = await peopleApi.listEmployees({ limit: 5 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();

    if (res.body.data.length) {
      const parsed = employeeSchema.safeParse(res.body.data[0]);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
  });

  // ── negative: no session -> 401 ──
  test('unauthenticated request is rejected (401)', { tag: ['@negative'] }, async ({ anonApi }) => {
    const res = await anonApi.listEmployees({ limit: 1 });
    expect(res.status).toBe(401);
  });

  // ── CRUD lifecycle, DATA-DRIVEN over the dataset ──
  for (const emp of employees) {
    test(`CRUD: ${emp.firstName} ${emp.lastName}`, { tag: ['@regression'] }, async ({ peopleApi }) => {
      // unique employeeId per run (fits the field length; avoids collisions)
      const employeeId = `${String(Date.now()).slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;
      let empNumber: number | undefined;

      try {
        // CREATE
        const created = await peopleApi.createEmployee({ ...emp, employeeId });
        expect(created.status, 'create returns 200').toBe(200);
        const parsed = employeeSchema.safeParse(created.body.data);
        expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
        empNumber = created.body.data.empNumber;
        expect(created.body.data.employeeId).toBe(employeeId);

        // READ it back
        const got = await peopleApi.getEmployee(empNumber);
        expect(got.status).toBe(200);
        expect(got.body.data.empNumber).toBe(empNumber);
      } finally {
        // DELETE (cleanup) — runs even if an assertion above failed
        if (empNumber) {
          const del = await peopleApi.deleteEmployee(empNumber);
          expect(del.status, 'delete returns 200').toBe(200);
        }
      }
    });
  }
});
