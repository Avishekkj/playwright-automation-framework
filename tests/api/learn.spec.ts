// LEVEL 1 — the simplest test that can exist.
// Goal: ask the API for the list of users, and check it replies "200 OK".

import { test, expect } from '@playwright/test';   // grab the 2 tools we need

test('level 1 - the API is reachable', async ({ request }) => {
  // "request" is our API caller (Playwright hands it to us for free).
  // .get(...) = send a GET request to this address.
  const resp = await request.get('https://gorest.co.in/public/v2/users');
  
  const respstatus = resp.status
  console.log(respstatus);  // resp.status = the reply code. 200 means "OK, here you go". 

  //console.log( await resp.json());  // res.body() = the reply body. This is the data we asked for.



  // res.status() = the reply code. 200 means "OK, here you go".
  expect(resp.status()).toBe(200);
});
