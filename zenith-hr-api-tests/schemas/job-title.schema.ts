import { z } from 'zod';

// This describes what a job title should LOOK LIKE when the app sends it back.
// If the app ever changes a field's type (say, id becomes text), our tests catch
// it. Extra fields the app sends (like jobSpecification) are simply ignored.
export const jobTitleSchema = z.object({
  id: z.number(), // must be a number
  title: z.string(), // must be text
  description: z.string().nullable(), // text OR empty (null)
  note: z.string().nullable(), // text OR empty (null)
});

export type JobTitle = z.infer<typeof jobTitleSchema>;
