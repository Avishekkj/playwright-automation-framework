import { z } from 'zod';

// An employment status is just an id + a name.
export const employmentStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;
