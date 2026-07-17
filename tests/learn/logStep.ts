// ============================================================================
// logStep.ts — one helper, apiStep(), that PRINTS a call (url + response) and
// VALIDATES its status. Comments marked 🔤 explain the SYNTAX (the grammar).
// ============================================================================

import { expect } from '@playwright/test';
// 🔤 named import — grab `expect` (the checker) from Playwright.

import type { APIResponse } from '@playwright/test';
// 🔤 import TYPE ... = we import only a TYPE (for TS), not real runnable code.
//    APIResponse is the shape of a Playwright response object.

export async function apiStep(opts: {
  label: string;
  method: string;
  url: string;
  res: APIResponse;
  expectStatus: number;
}): Promise<unknown> {
  // 🔤 export function NAME(...) = declare a function others can import.
  // 🔤 async                     = it awaits (reading the body is async).
  // 🔤 opts: { ... }             = ONE parameter named `opts`, whose TYPE is written
  //    inline: an object with 5 fields. (label/method/url are strings, etc.)
  //    Passing one object = "named arguments" — clearer than 5 loose params.
  // 🔤 : Promise<unknown>        = the RETURN type. Because it's async it returns a
  //    Promise; `unknown` = "some value, type not known yet".

  const { label, method, url, res, expectStatus } = opts;
  // 🔤 DESTRUCTURING — pull the 5 fields OUT of `opts` into their own variables,
  //    so below we write `url` instead of `opts.url`.

  let body: unknown = null;
  // 🔤 let (not const) = this value WILL change below.
  // 🔤 : unknown       = its type isn't known yet. Starts as null (empty).

  try {
    body = await res.json();
    // 🔤 try { ... }        = "attempt this; if it throws, jump to catch".
    // 🔤 await res.json()    = read + parse the response body as JSON (async).
  } catch {
    body = '(no body)';
    // 🔤 catch { ... }       = runs ONLY if the try block threw.
    //    DELETE returns 204 with no body, so json() throws → we set a label.
  }

  console.log(`\n──────────────────────────────────────────────`);
  console.log(`🧪 ${label}`);
  console.log(`🔗 ${method} ${url}`);
  console.log(`📦 Status: ${res.status()}  (expected ${expectStatus})`);
  console.log(`📥 Response:`, JSON.stringify(body, null, 2));
  // 🔤 console.log(...)       = print to the terminal.
  // 🔤 `...${x}...`           = template strings again; ${} inserts a value.
  // 🔤 \n                     = a NEWLINE (blank line before the divider).
  // 🔤 res.status()           = a METHOD call — the () runs it, returns the number.
  // 🔤 JSON.stringify(v,null,2) = turn the object into pretty text; 2 = indent spaces.

  expect(res.status(), `${label} — status`).toBe(expectStatus);
  // 🔤 expect(actual, message).toBe(expected) = the CHECK. If the status isn't the
  //    expected number, the test FAILS here. The 2nd arg is a label shown on failure.

  console.log(`✅ Validation passed`);

  return body;
  // 🔤 return = hand the parsed body back to the caller, so the test can use it
  //    (e.g. read an id, or map the list of users).
}
