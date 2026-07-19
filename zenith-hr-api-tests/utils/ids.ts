// A unique NUMERIC id for test data (employeeId must be numeric). Safe across
// parallel workers: timestamp tail + a random block makes collisions negligible.
export function uniqueNumericId(): string {
  const t = String(Date.now()).slice(-4);
  const r = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `${t}${r}`; // 9 digits
}
