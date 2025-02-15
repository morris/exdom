import { expect, test } from '@playwright/test';
import { useTestServer } from './useTestServer.js';

test.describe('requestAnimationFrameOnce', () => {
  const getServer = useTestServer(test);

  test('enqueues functions to run once in the next frame', async ({ page }) => {
    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <h1>requestAnimationFrameOnce</h1>
      <p class="foo1"></p>
      <p class="bar1"></p>
      <p class="foo2"></p>
      <p class="bar2"></p>

      <script type="module">
        import { requestAnimationFrameOnce, qsr } from '../test-build/src/exdom.js';

        const foos = [];
        const bars = [];

        function foo() {
          foos.push("foo");
        }

        function bar() {
          bars.push("bar");
        }

        requestAnimationFrameOnce(foo);
        requestAnimationFrameOnce(bar);
        requestAnimationFrameOnce(foo);
        requestAnimationFrameOnce(bar);
        requestAnimationFrameOnce(bar);

        requestAnimationFrameOnce(() => {
          qsr(document, ".foo1").innerText = foos.length.toString();
          qsr(document, ".bar1").innerText = bars.length.toString();
        });

        requestAnimationFrameOnce(() => {
          requestAnimationFrameOnce(foo);
          requestAnimationFrameOnce(bar);
          requestAnimationFrameOnce(foo);
          requestAnimationFrameOnce(bar);
          requestAnimationFrameOnce(bar);

          requestAnimationFrameOnce(() => {
            qsr(document, ".foo2").innerText = foos.length.toString();
            qsr(document, ".bar2").innerText = bars.length.toString();
          });
        });


      </script>
    `);

    await expect(page.locator('.foo1')).toHaveText('1');
    await expect(page.locator('.bar1')).toHaveText('1');
    await expect(page.locator('.foo2')).toHaveText('2');
    await expect(page.locator('.bar2')).toHaveText('2');
  });
});
