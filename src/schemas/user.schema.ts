import { z } from 'zod';

/** Contract for a GoRest user. Types are DERIVED from this schema (single source of truth). */
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  gender: z.enum(['male', 'female']),
  status: z.enum(['active', 'inactive']),
});

export const userListSchema = z.array(userSchema);

/** GoRest 422 validation error body: array of field-level errors. */
export const validationErrorSchema = z.array(
  z.object({
    field: z.string(),
    message: z.string(),
  }),
);

export type User = z.infer<typeof userSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;

/** Payload to create/update a user (no server-assigned id). */
export type UserInput = Omit<User, 'id'>;
