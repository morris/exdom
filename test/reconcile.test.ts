import { expect, test } from '@playwright/test';
import './coverage.js';
import { useTestServer } from './useTestServer.js';

test.describe('reconcile', () => {
  const getServer = useTestServer(test);

  test("reconciles a containers' children by mapping given items to individual elements", async ({
    page,
  }) => {
    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <div class="empty"></div>
      <div class="trash">
        <p class="removed"></p>
      </div>
      <ul class="list">
        <li data-key="1" class="kept">1</li>
        <li data-key="2">2</li>
        <li data-key="3" class="kept">3</li>
      </ul>

      <script type="module">
        import { reconcile, qsr } from '../test-build/src/exdom.js';

        reconcile({
          container: qsr(document, '.empty'),
          items: [{ id: '1'  }, { id: '2' }],
          create: (item) => document.createElement("p"),
          update: (child, item) => {
            child.innerText = item.id;
          }
        });

        reconcile({
          container: qsr(document, '.trash'),
          items: [{ key: '1'  }, { key: '2' }],
          create: (item) => document.createElement("p"),
          update: (child, item) => {
            child.innerText = item.key;
          }
        });

        reconcile({
          container: qsr(document, '.list'),
          items: [{ uuid: '1' }, { uuid: '3' }, { uuid: '4' }],
          key: (item) => item.uuid,
          create: (item) => document.createElement("li"),
          update: (child, item) => {
            child.innerText = item.uuid;
          }
        });
      </script>
    `);

    await expect(page.locator('.empty p').nth(0)).toHaveText('1');
    await expect(page.locator('.empty p').nth(1)).toHaveText('2');

    await expect(page.locator('.trash p')).toHaveCount(2);
    await expect(page.locator('.trash p').nth(0)).toHaveText('1');
    await expect(page.locator('.trash p').nth(1)).toHaveText('2');

    await expect(page.locator('.list li')).toHaveCount(3);
    await expect(page.locator('.list li').nth(0)).toHaveText('1');
    await expect(page.locator('.list li').nth(0)).toHaveClass('kept');
    await expect(page.locator('.list li').nth(1)).toHaveText('3');
    await expect(page.locator('.list li').nth(1)).toHaveClass('kept');
    await expect(page.locator('.list li').nth(2)).toHaveText('4');
  });
});
