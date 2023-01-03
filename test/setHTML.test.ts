import { expect, test } from '@playwright/test';
import { requireServer, startCoverage, stopCoverage } from './testUtil';

test.describe('The setHTML function', () => {
  const getServer = requireServer(test);

  test('should set inner HTML of an element', async ({ page }) => {
    await startCoverage(page);

    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <p class="basic"></p>
      <p class="overwrite">Test</p>
      <p class="empty">Test</p>

      <script type="module">
        import { setHTML, qsr } from '../build/index.js';

        setHTML(qsr(document, '.basic'), 'Hello <i>World</i>!');
        setHTML(qsr(document, '.basic'), 'Hello <i>World</i>!');
        setHTML(qsr(document, '.overwrite'), '<strong>Overwritten</strong>');
        setHTML(qsr(document, '.empty'), '');
      </script>
    `);

    await stopCoverage(page);

    await expect(page.locator('.basic i')).toHaveText('World');
    await expect(page.locator('.overwrite strong')).toHaveText('Overwritten');
    await expect(page.locator('.empty')).toHaveText('');
  });
});
