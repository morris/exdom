/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { getRefs, getWindow, getDocument, forEach } from "../src/util";

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

  describe("getWindow and getDocument", () => {
    const dom = new JSDOM(`<!DOCTYPE html><div id="test"><p>test</p></div>`);

    it("should work for anything in a document", () => {
      traverse(dom.window.document);

      function traverse(node) {
        assert.equal(getWindow(node), dom.window);
        assert.equal(getDocument(node), dom.window.document);
        forEach(node.childNodes, traverse);
      }
    });

    it("should work for window", () => {
      assert.equal(getWindow(dom.window), dom.window);
      assert.equal(getDocument(dom.window), dom.window.document);
    });
  });
});
