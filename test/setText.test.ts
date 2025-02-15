import { expect, test } from '@playwright/test';
import './coverage.js';
import { useTestServer } from './useTestServer.js';

test.describe('setText', () => {
  const getServer = useTestServer(test);

  test('sets inner text of an element', async ({ page }) => {
    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <p class="basic"></p>
      <p class="escaped"></p>
      <p class="overwrite">Test</p>
      <p class="empty">Test</p>

      <script type="module">
        import { setText, qsr } from '../test-build/src/exdom.js';

        setText(qsr(document, '.basic'), 'Hello World!');
        setText(qsr(document, '.basic'), 'Hello World!');
        setText(qsr(document, '.escaped'), 'Hello <i>World</i>!');
        setText(qsr(document, '.overwrite'), 'Overwritten');
        setText(qsr(document, '.empty'), '');
      </script>
    `);

    await expect(page.locator('.basic')).toHaveText('Hello World!');
    await expect(page.locator('.escaped')).toHaveText('Hello <i>World</i>!');
    await expect(page.locator('.overwrite')).toHaveText('Overwritten');
    await expect(page.locator('.empty')).toHaveText('');
  });
});
