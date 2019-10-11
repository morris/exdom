/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";
import { getWindow, getDocument, forEach } from "../src/util";

describe("From the util module,", () => {
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
