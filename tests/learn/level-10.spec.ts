// LEVEL 10 — API MOCKING via network interception.
// This is a BROWSER feature: page.route() sits between the browser and the
// network, so we can FAKE responses. Great for testing UI states (empty,
// error, slow) without needing the real backend to be in that state.
//
// To stay 100% offline we serve a tiny fake page AND fake its API, both via route.

import { test, expect } from '@playwright/test';

test.describe('Level 10 - API mocking with page.route', () => {

  // ---- 1. MOCK a successful API response ----
  test('mock the API, page renders our fake data', { tag: ['@mock'] }, async ({ page }) => {
    const fakeUsers = [{ name: 'Mocked Alice' }, { name: 'Mocked Bob' }];

    // intercept the API call and RETURN our fake data (route.fulfill = "answer it myself")
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeUsers),
      });
    });

    // intercept the PAGE itself and serve a tiny app that fetches /api/users
    await page.route('https://demo.local/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body><ul id="list"></ul>
          <script>
            fetch('/api/users').then(r => r.json()).then(users => {
              document.getElementById('list').innerHTML =
                users.map(u => '<li>' + u.name + '</li>').join('');
            });
          </script></body></html>`,
      });
    });

    await page.goto('https://demo.local/');

    // the page shows the MOCKED names — proof the mock was used, not a real API
    await expect(page.getByText('Mocked Alice')).toBeVisible();
    await expect(page.getByText('Mocked Bob')).toBeVisible();
  });

  // ---- 2. SIMULATE a server error (500) to test the sad path ----
  test('simulate a 500 error and check the UI handles it', { tag: ['@mock'] }, async ({ page }) => {
    // force the API to fail — impossible to trigger reliably on a real server
    await page.route('**/api/users', (route) => route.fulfill({ status: 500, body: 'boom' }));

    await page.route('https://demo.local/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body><div id="msg">loading...</div>
          <script>
            fetch('/api/users')
              .then(r => { if (!r.ok) throw new Error('failed'); return r.json(); })
              .then(() => document.getElementById('msg').textContent = 'ok')
              .catch(() => document.getElementById('msg').textContent = 'Something went wrong');
          </script></body></html>`,
      }),
    );

    await page.goto('https://demo.local/');

    // the UI should show its error message because we forced the API to fail
    await expect(page.getByText('Something went wrong')).toBeVisible();
  });
});
