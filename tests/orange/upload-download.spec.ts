// UPLOAD + DOWNLOAD examples.
// We serve our own tiny HTML page (setContent) so it's 100% reliable — the point
// is the Playwright APIs:
//   • upload   -> locator.setInputFiles(path)
//   • download -> page.waitForEvent('download') + download.saveAs(path)
//
// (Real apps use the SAME calls — e.g. OrangeHRM's employee photo upload is just
//  setInputFiles on its hidden <input type="file">.)

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';

// a tiny page with a file input + a download link
const PAGE = `
  <input type="file" id="fileInput" />
  <span id="fileName"></span>
  <a id="downloadLink"
     href="data:text/plain;charset=utf-8,Hello%20from%20Playwright%20download"
     download="report.txt">Download report</a>
  <script>
    document.getElementById('fileInput').addEventListener('change', e => {
      document.getElementById('fileName').textContent = e.target.files[0]?.name || '';
    });
  </script>
`;

test('upload a file', async ({ page }) => {
  await page.setContent(PAGE);

  // path to the file that sits next to this spec (tests/orange/files/sample.txt)
  const filePath = fileURLToPath(new URL('./files/sample.txt', import.meta.url));

  // THE UPLOAD: hand the file path to the <input type="file">
  await page.locator('#fileInput').setInputFiles(filePath);

  // verify the page picked it up
  await expect(page.locator('#fileName')).toHaveText('sample.txt');
});

test('download a file', async ({ page }) => {
  await page.setContent(PAGE);

  // THE DOWNLOAD: start listening BEFORE the click that triggers it
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#downloadLink').click();
  const download = await downloadPromise;

  // check the filename the server suggested
  expect(download.suggestedFilename()).toBe('report.txt');

  // save it somewhere (test-results/ is gitignored; saveAs creates the folder)
  const savePath = fileURLToPath(new URL('../../test-results/report.txt', import.meta.url));
  await download.saveAs(savePath);
  console.log('downloaded to:', savePath);
});
