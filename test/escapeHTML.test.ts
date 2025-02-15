import { expect, test } from '@playwright/test';
import { escapeHTML } from '../src/exdom.js';

test('escapeHTML', () => {
  expect(escapeHTML('')).toEqual('');
  expect(escapeHTML('test')).toEqual('test');
  expect(escapeHTML('<script>')).toEqual('&lt;script&gt;');
  expect(escapeHTML('"hello"')).toEqual('&quot;hello&quot;');
  expect(escapeHTML('<a href="hackerz">&amp;</a>')).toEqual(
    '&lt;a href=&quot;hackerz&quot;&gt;&amp;amp;&lt;/a&gt;',
  );
});
