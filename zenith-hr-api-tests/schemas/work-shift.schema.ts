import { z } from 'zod';

// A work shift has a name plus its times. (hoursPerDay comes back as a number.)
export const workShiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  hoursPerDay: z.number(),
});

export type WorkShift = z.infer<typeof workShiftSchema>;
