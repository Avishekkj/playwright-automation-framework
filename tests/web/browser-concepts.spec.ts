// LESSONS LEARNED — browser & context concepts.
// These are all BROWSER CONTEXT options. We create contexts explicitly with
// browser.newContext({...}) so each concept is clear and self-contained.
//
// Concepts: device emulation (iPhone) · ignore SSL errors · geolocation
// permission · context isolation · multiple tabs · locale/timezone · dark mode ·
// offline mode.

import { test, expect, devices } from '@playwright/test';

// ── 1. DEVICE EMULATION (iPhone): fake a phone's screen, touch, user-agent ──
test('iPhone emulation', async ({ browser }) => {
  // spread a built-in device preset into a new context
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto('https://example.com');

  const size = page.viewportSize();
  console.log('iPhone viewport:', size);
  expect(size?.width).toBe(390);                 // iPhone 13 logical width
  // the emulated user-agent identifies as an iPhone
  const ua = await page.evaluate(() => navigator.userAgent);
  expect(ua).toContain('iPhone');

  await context.close();
});

// ── 2. IGNORE HTTPS / SSL CERT ERRORS ──
// Some test/staging sites use self-signed certs. Normally Playwright refuses
// to load them; ignoreHTTPSErrors lets it through.
test('ignore SSL certificate errors', async ({ browser }) => {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // this site has a self-signed cert on purpose
  const res = await page.goto('https://self-signed.badssl.com/');
  expect(res?.ok()).toBeTruthy();                // loaded despite the bad cert
  console.log('loaded self-signed site, status:', res?.status());

  await context.close();
});

// ── 3. GEOLOCATION PERMISSION (allow + fake coordinates) ──
test('grant geolocation and fake the location', async ({ browser }) => {
  const sydney = { latitude: -33.8688, longitude: 151.2093 };
  const context = await browser.newContext({
    permissions: ['geolocation'],   // ALLOW the geolocation permission
    geolocation: sydney,            // and feed it fake coordinates
  });
  const page = await context.newPage();
  await page.goto('https://example.com'); // geolocation needs a secure origin

  // ask the browser for the location; it returns our faked coords
  const coords = await page.evaluate(
    () =>
      new Promise<{ latitude: number; longitude: number }>((resolve) => {
        navigator.geolocation.getCurrentPosition((pos) =>
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        );
      }),
  );
  console.log('location reported:', coords);
  expect(coords.latitude).toBeCloseTo(sydney.latitude);
  expect(coords.longitude).toBeCloseTo(sydney.longitude);

  await context.close();
});

// ── 4. CONTEXT ISOLATION: two contexts don't share cookies/storage ──
test('two contexts are isolated from each other', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await pageA.goto('https://example.com');
  await pageB.goto('https://example.com');

  // set a value in A's storage only
  await pageA.evaluate(() => localStorage.setItem('user', 'Alice'));

  const inA = await pageA.evaluate(() => localStorage.getItem('user'));
  const inB = await pageB.evaluate(() => localStorage.getItem('user'));
  console.log('A sees:', inA, '| B sees:', inB);
  expect(inA).toBe('Alice');
  expect(inB).toBeNull();          // B is a totally separate session

  await ctxA.close();
  await ctxB.close();
});

// ── 5. MULTIPLE TABS (pages) inside ONE context ──
test('open multiple tabs in one context', async ({ browser }) => {
  const context = await browser.newContext();
  const tab1 = await context.newPage();
  const tab2 = await context.newPage();       // second tab, same session

  await tab1.goto('https://example.com');
  await tab2.goto('https://playwright.dev');

  expect(context.pages().length).toBe(2);     // two tabs open
  await expect(tab2).toHaveTitle(/Playwright/);

  await context.close();
});

// ── 6. LOCALE + TIMEZONE emulation ──
test('emulate locale and timezone', async ({ browser }) => {
  const context = await browser.newContext({
    locale: 'fr-FR',
    timezoneId: 'Australia/Sydney',
  });
  const page = await context.newPage();
  await page.goto('https://example.com');

  const info = await page.evaluate(() => ({
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
  console.log('emulated:', info);
  expect(info.locale).toBe('fr-FR');
  expect(info.tz).toBe('Australia/Sydney');

  await context.close();
});

// ── 7. DARK MODE (color scheme) ──
test('emulate dark mode', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('https://example.com');

  const isDark = await page.evaluate(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  expect(isDark).toBeTruthy();

  await context.close();
});

// ── 8. OFFLINE mode: simulate no network ──
test('simulate offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com');       // works online

  await context.setOffline(true);               // pull the plug
  // make a REAL network request (cache-busted) — it must reject when offline
  const failed = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/?nocache=' + Date.now());
      return false;
    } catch {
      return true;                               // network error = offline works
    }
  });
  expect(failed).toBeTruthy();

  await context.close();
});
