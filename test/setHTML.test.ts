import { expect, test } from '@playwright/test';
import './coverage.js';
import { useTestServer } from './useTestServer.js';

test.describe('setHTML', () => {
  const getServer = useTestServer(test);

  test('sets inner HTML of an element', async ({ page }) => {
    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <p class="basic"></p>
      <p class="overwrite">Test</p>
      <p class="empty">Test</p>

      <script type="module">
        import { setHTML, qsr } from '../test-build/src/exdom.js';

        setHTML(qsr(document, '.basic'), 'Hello <i>World</i>!');
        setHTML(qsr(document, '.basic'), 'Hello <i>World</i>!');
        setHTML(qsr(document, '.overwrite'), '<strong>Overwritten</strong>');
        setHTML(qsr(document, '.empty'), '');
      </script>
    `);

    await expect(page.locator('.basic i')).toHaveText('World');
    await expect(page.locator('.overwrite strong')).toHaveText('Overwritten');
    await expect(page.locator('.empty')).toHaveText('');
  });
});
