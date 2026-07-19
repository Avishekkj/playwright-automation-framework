// logger.ts — a tiny, tidy logger so tests read the same way and the output is
// easy to scan. Nothing fancy on purpose — just neat prefixes.

export const log = {
  // a numbered step inside a test:  "  STEP 1: do the thing"
  step: (n: number, message: string) => console.log(`  STEP ${n}: ${message}`),

  // an API action the helper is doing:  "     → [API] GET list"
  api: (message: string) => console.log(`     → [API] ${message}`),

  // a plain note
  info: (message: string) => console.log(`     ${message}`),

  // a test finished successfully
  pass: (message: string) => console.log(`  ✅ ${message}`),
};
