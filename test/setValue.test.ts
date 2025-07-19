import { expect, test } from '@playwright/test';
import './coverage.js';
import { useTestServer } from './useTestServer.js';

test.describe('setValue', () => {
  const getServer = useTestServer(test);

  test('sets value of form controls', async ({ page }) => {
    const { url } = getServer();

    await page.goto(url);

    await page.setContent(`
      <form>
        <input type="text">
        <input type="checkbox" name="checkbox">
        <input type="checkbox" name="checkboxmultiple" value="a">
        <input type="checkbox" name="checkboxmultiple" value="b">
        <input type="radio" name="radio" value="alpha">
        <input type="radio" name="radio" value="beta">
        <textarea></textarea>
        <select>
          <option value="first">First</option>
          <option value="second">Second</option>
        </select>
      </form>

      <script type="module">
        import { setValue, qsr } from '../test-build/src/exdom.js';

        setValue(qsr(document, 'input[type="text"]'), 'Hello World!');
        setValue(qsr(document, 'input[name="checkbox"]'), true);
        setValue(qsr(document, 'input[value="a"]'), 'a');
        setValue(qsr(document, 'input[value="b"]'), ['a']);
        setValue(qsr(document, 'input[value="alpha"]'), "alpha");
        setValue(qsr(document, 'input[value="beta"]'), "alpha");
        setValue(qsr(document, 'textarea'), "Hello World!");
        setValue(qsr(document, 'select'), "second");
      </script>
    `);

    await expect(page.locator('input[type="text"]')).toHaveValue(
      'Hello World!',
    );
    await expect(page.locator('input[name="checkbox"]')).toHaveValue('on');
    await expect(page.locator('textarea')).toHaveValue('Hello World!');
    await expect(page.locator('select')).toHaveValue('second');

    const serialized = await page.$eval('form', (form) => {
      const formData = new FormData(form as HTMLFormElement);
      const result: Record<string, string | string[] | File> = {};

      for (const [key, value] of formData.entries()) {
        result[key] = value;
      }

      return result;
    });

    expect(serialized).toEqual({
      checkbox: 'on',
      checkboxmultiple: 'a',
      radio: 'alpha',
    });
  });
});
