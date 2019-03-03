/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { getRefs } from "../src/util";

describe("From the util module,", () => {
  describe("getRefs", () => {
    it("should build a refs object", () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <div id="test">
          <div class="foo" id="foo">
            <p class="bar" id="bar"></p>
            <p class="bar baz" id="bar-baz"></p>
            <p class="foo-bar" id="foo-bar"></p>
          </div>
        </div>
      `);

      const refs = getRefs(dom.window.document.getElementById("test"));

      assert.equal(Object.keys(refs).length, 4);

      assert.equal(refs.foo[0], dom.window.document.getElementById("foo"));
      assert.equal(refs.bar[0], dom.window.document.getElementById("bar"));
      assert.equal(refs.bar[1], dom.window.document.getElementById("bar-baz"));
      assert.equal(refs.baz[0], dom.window.document.getElementById("bar-baz"));
      assert.equal(
        refs.fooBar[0],
        dom.window.document.getElementById("foo-bar")
      );

      const refs2 = getRefs(dom.window.document.getElementById("test"), "foo-");

      assert.equal(Object.keys(refs2).length, 1);

      assert.equal(refs2.bar[0], dom.window.document.getElementById("foo-bar"));
    });
  });
});
