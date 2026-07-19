import { z } from 'zod';

// A job category is just an id + a name.
export const jobCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type JobCategory = z.infer<typeof jobCategorySchema>;
