import { z } from 'zod';

// A pay grade the app sends back. It also carries a "currencies" list, which we
// allow but don't force. Extra fields are ignored.
export const payGradeSchema = z.object({
  id: z.number(),
  name: z.string(),
  currencies: z.array(z.unknown()).optional(),
});

export type PayGrade = z.infer<typeof payGradeSchema>;
