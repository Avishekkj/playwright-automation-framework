// logger.ts — same tiny logger the API suite uses, so the UI E2E reads the same
// way and its numbered steps line up 1:1 with the API version's steps.

export const log = {
  // a numbered step inside a test:  "  STEP 1: do the thing"
  step: (n: number, message: string) => console.log(`  STEP ${n}: ${message}`),

  // a UI action the page object is doing:  "     → [UI] click Save"
  ui: (message: string) => console.log(`     → [UI] ${message}`),

  // a plain note
  info: (message: string) => console.log(`     ${message}`),

  // a test finished successfully
  pass: (message: string) => console.log(`  ✅ ${message}`),
};
