import { expect, test } from '@playwright/test';
import { requireServer, startCoverage, stopCoverage } from './testUtil';

test.describe('The qs function', () => {
  const getServer = requireServer(test);

  test('should select the first matching element for the given selectors', async ({
    page,
  }) => {
    await startCoverage(page);

    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <h1>qs</h1>
      <p class="foo">foo</p>
      <p class="bar">bar</p>
      <div class="bar">
        <h2>bar</h2>
        <p class="baz">baz</p>
      </div>
      <p class="baz">baz</p>

      <script type="module">
        import { qs } from '../build/index.js';

        qs(document, '.foo').classList.add('selected1');
        qs(document, '.bar').classList.add('selected2');
        qs(document, 'div.bar').classList.add('selected3');
        qs(qs(document, 'div.bar'), '> .baz').classList.add('selected4');
      </script>
    `);

    await expect(page.locator('.foo')).toHaveClass('foo selected1', {
      timeout: 300000,
    });
    await expect(page.locator('.bar').first()).toHaveClass('bar selected2');
    await expect(page.locator('div.bar')).toHaveClass('bar selected3');
    await expect(page.locator('.bar > .baz')).toHaveClass('baz selected4');

    await stopCoverage(page);
  });
});
