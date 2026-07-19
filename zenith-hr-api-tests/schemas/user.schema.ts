import { z } from 'zod';

// A system user: id + username + status + which role they have.
export const userSchema = z.object({
  id: z.number(),
  userName: z.string(),
  status: z.boolean(),
  userRole: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type User = z.infer<typeof userSchema>;
