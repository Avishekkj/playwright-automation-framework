// WIDGETS PLAYGROUND — checkbox, radio, dropdown, filter, split, Promise.all,
// toBeTruthy/toBeFalsy. We build our OWN tiny HTML form (via setContent) so it's
// 100% offline and reliable — the focus is purely the mechanics.

import { test, expect } from '@playwright/test';

// ── EXECUTION MODE for THIS file ─────────────────────────────────────────────
// By default, tests in one file run SERIALLY on ONE worker.
//   'parallel' -> the 5 tests here run at the SAME TIME across multiple workers.
//   'serial'   -> run in order on ONE worker; if one FAILS, the rest are SKIPPED.
// Flip the word below to compare, then watch the "using N workers" line.
test.describe.configure({ mode: 'serial' });

// a small HTML form we control
const FORM = `
  <form>
    <label><input type="checkbox" id="sub"> Subscribe</label>

    <label><input type="radio" name="plan" value="free"> Free</label>
    <label><input type="radio" name="plan" value="pro">  Pro</label>

    <select id="country">
      <option value="in">India</option>
      <option value="us">USA</option>
      <option value="uk">UK</option>
    </select>

    <ul id="fruits">
      <li>Apple $2</li>
      <li>Banana $1</li>
      <li>Cherry $5</li>
    </ul>
  </form>
`;

test.beforeEach(async ({ page }) => {
  await page.setContent(FORM); // load our HTML straight into the page (no server)
});

// ---- CHECKBOX + toBeTruthy / toBeFalsy ----
test('@checkbox checkbox: check, assert, uncheck', async ({ page }) => {
  const box = page.getByRole('checkbox', { name: 'Subscribe' });

  // starts unchecked
  expect(await box.isChecked()).toBeFalsy();   // isChecked() returns a boolean
  await expect(box).not.toBeChecked();         // the built-in matcher (auto-waits)

  await box.check();                           // tick it
  expect(await box.isChecked()).toBeTruthy();
  await expect(box).toBeChecked();

  await box.uncheck();                         // untick it
  await expect(box).not.toBeChecked();
});

// ---- RADIO BUTTONS ----
test('radio: only one can be selected', async ({ page }) => {
  const free = page.getByRole('radio', { name: 'Free' });
  const pro = page.getByRole('radio', { name: 'Pro' });

  await pro.check();
  await expect(pro).toBeChecked();
  await expect(free).not.toBeChecked();  // picking Pro auto-deselects Free
});

// ---- DROPDOWN (native <select>) ----
test('@dropdown dropdown: select an option', async ({ page }) => {
  const country = page.locator('#country');

  await country.selectOption('us');            // by value
  await expect(country).toHaveValue('us');

  await country.selectOption({ label: 'UK' }); // by visible label
  await expect(country).toHaveValue('uk');
});

// ---- FILTER a list + SPLIT a string ----
test('filter a list item, then split its text', async ({ page }) => {
  const fruits = page.locator('#fruits li');
  await expect(fruits).toHaveCount(3);

  // filter({ hasText }) narrows a many-match locator down to the one you want
  const cherry = fruits.filter({ hasText: 'Cherry' });
  await expect(cherry).toHaveText('Cherry $5');

  // split(): a plain JS string method. "Cherry $5".split('$') -> ['Cherry ', '5']
  const text = await cherry.innerText();     // "Cherry $5"
  const price = text.split('$')[1];          // take the part after '$' -> "5"
  console.log('cherry price:', price);
  expect(price).toBe('5');
});

// ---- Promise.all: run several async reads AT THE SAME TIME ----
test('@promise Promise.all reads all items in parallel', async ({ page }) => {
  const fruits = page.locator('#fruits li');

  // instead of awaiting one-by-one, fire all three reads together and wait once.
  const [a, b, c] = await Promise.all([
    fruits.nth(0).innerText(),
    fruits.nth(1).innerText(),
    fruits.nth(2).innerText(),
  ]);

  console.log('all fruits:', [a, b, c]);
  expect([a, b, c]).toEqual(['Apple $2', 'Banana $1', 'Cherry $5']);
});
