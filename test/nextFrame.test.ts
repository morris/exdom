import { expect, test } from '@playwright/test';
import { requireServer, startCoverage, stopCoverage } from './testUtil';

test.describe('The nextFrame function', () => {
  const getServer = requireServer(test);

  test('should enqueue functions to run once in the next frame', async ({
    page,
  }) => {
    await startCoverage(page);

    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <h1>nextFrame</h1>
      <p class="foo1"></p>
      <p class="bar1"></p>
      <p class="foo2"></p>
      <p class="bar2"></p>

      <script type="module">
        import { nextFrame, qsr } from '../build/index.js';

        const foos = [];
        const bars = [];

        function foo() {
          foos.push("foo");
        }

        function bar() {
          bars.push("bar");
        }

        nextFrame(foo);
        nextFrame(bar);
        nextFrame(foo);
        nextFrame(bar);
        nextFrame(bar);

        nextFrame(() => {
          qsr(document, ".foo1").innerText = foos.length.toString();
          qsr(document, ".bar1").innerText = bars.length.toString();
        });

        nextFrame(() => {
          nextFrame(foo);
          nextFrame(bar);
          nextFrame(foo);
          nextFrame(bar);
          nextFrame(bar);

          nextFrame(() => {
            qsr(document, ".foo2").innerText = foos.length.toString();
            qsr(document, ".bar2").innerText = bars.length.toString();
          });
        });


      </script>
    `);

    await stopCoverage(page);

    await expect(page.locator('.foo1')).toHaveText('1');
    await expect(page.locator('.bar1')).toHaveText('1');
    await expect(page.locator('.foo2')).toHaveText('2');
    await expect(page.locator('.bar2')).toHaveText('2');
  });
});
