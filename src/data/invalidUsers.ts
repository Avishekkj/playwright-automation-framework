import { buildUser } from '../utils/dataFactory';
import type { UserInput } from '../schemas/user.schema';

/**
 * Data-driven negative cases. Each row is one invalid payload + the field
 * GoRest should reject it on. The test iterates over these -> one test per row.
 */
export interface InvalidCase {
  name: string;
  payload: Partial<UserInput>;
  expectField: string;
}

export const invalidUserCases: InvalidCase[] = [
  {
    name: 'missing email',
    payload: { ...buildUser(), email: '' },
    expectField: 'email',
  },
  {
    name: 'malformed email',
    payload: { ...buildUser(), email: 'not-a-valid-email' },
    expectField: 'email',
  },
  {
    name: 'missing name',
    payload: { ...buildUser(), name: '' },
    expectField: 'name',
  },
  {
    name: 'invalid gender',
    payload: { ...buildUser(), gender: 'unknown' as UserInput['gender'] },
    expectField: 'gender',
  },
  {
    name: 'invalid status',
    payload: { ...buildUser(), status: 'paused' as UserInput['status'] },
    expectField: 'status',
  },
];
