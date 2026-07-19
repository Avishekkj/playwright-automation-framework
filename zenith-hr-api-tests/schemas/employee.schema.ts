import { z } from 'zod';

// Contract for a PeopleHRM employee (core fields; api/v2 objects carry extras
// which Zod ignores by default — we validate the fields that matter).
export const employeeSchema = z.object({
  empNumber: z.number().int().positive(),
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export type Employee = z.infer<typeof employeeSchema>;
