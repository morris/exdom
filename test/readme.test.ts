import { expect, test } from '@playwright/test';
import { startCoverage, stopCoverage, useTestServer } from './testUtil';

test.describe('README example', () => {
  const getServer = useTestServer(test);

  test('works', async ({ page }) => {
    await startCoverage(page);

    const { url } = getServer();

    await page.goto(url);
    await page.setViewportSize({ width: 400, height: 300 });

    await page.setContent(`
      <div id="app"></div>
      <script type="module" src="../test-build/test/readme.js"></script>
    `);

    await expect(page.locator('#app')).toHaveScreenshot();

    await page.locator('[name=label]').fill('Hi, test!');
    await page.locator('.add').click();

    await expect(page.locator('#app')).toHaveScreenshot();

    await stopCoverage(page);
  });
});
