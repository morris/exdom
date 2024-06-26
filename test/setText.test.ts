import { expect, test } from '@playwright/test';
import { startCoverage, stopCoverage, useTestServer } from './testUtil';

test.describe('setText', () => {
  const getServer = useTestServer(test);

  test('sets inner text of an element', async ({ page }) => {
    await startCoverage(page);

    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <p class="basic"></p>
      <p class="escaped"></p>
      <p class="overwrite">Test</p>
      <p class="empty">Test</p>

      <script type="module">
        import { setText, qsr } from '../build/index.js';

        setText(qsr(document, '.basic'), 'Hello World!');
        setText(qsr(document, '.basic'), 'Hello World!');
        setText(qsr(document, '.escaped'), 'Hello <i>World</i>!');
        setText(qsr(document, '.overwrite'), 'Overwritten');
        setText(qsr(document, '.empty'), '');
      </script>
    `);

    await stopCoverage(page);

    await expect(page.locator('.basic')).toHaveText('Hello World!');
    await expect(page.locator('.escaped')).toHaveText('Hello <i>World</i>!');
    await expect(page.locator('.overwrite')).toHaveText('Overwritten');
    await expect(page.locator('.empty')).toHaveText('');
  });
});
