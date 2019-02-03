/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { listen } from "../src/events";
import { setChildren, setChild, setHtml } from "../src/render";

describe("From the render module,", () => {
  describe("setChild", () => {
    it("should render a child", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      let init = false;
      let pass;

      setChild(
        dom.window.document.getElementById("test"),
        {
          html: "<p>test</p>",
          init: el => {
            init = true;
            assert.equal(el.tagName, "P");
            assert.equal(el.innerHTML, "test");

            listen(el, "pass", e => {
              pass = e.detail;
            });
          }
        },
        {
          pass: {
            foo: "bar"
          }
        }
      );

      assert.ok(init);
      assert.deepStrictEqual(pass, {
        foo: "bar"
      });
    });
  });

  describe("setChildren", () => {
    it("should render children", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);

      const options = {
        html: "<p>lel</p>",
        init: el => {
          listen(el, "pass", e => {
            setHtml(el, e.detail.test);
          });
        }
      };

      setChildren(
        dom.window.document.getElementById("test"),
        [
          { test: "foo" },
          { test: "bar" },
          { test: "baz" },
          { test: "lol" }
        ].map(pass => ({
          ...options,
          pass
        }))
      );

      assert.equal(
        dom.window.document.getElementById("test").innerHTML,
        "<p>foo</p><p>bar</p><p>baz</p><p>lol</p>"
      );

      setChildren(
        dom.window.document.getElementById("test"),
        [
          { test: "foo" },
          { test: "wow" },
          { test: "baz" },
          { test: "lol" },
          { test: "lel" }
        ].map(pass => ({
          ...options,
          pass
        }))
      );

      assert.equal(
        dom.window.document.getElementById("test").innerHTML,
        "<p>foo</p><p>wow</p><p>baz</p><p>lol</p><p>lel</p>"
      );

      setChildren(
        dom.window.document.getElementById("test"),
        [
          { test: "foo", html: "<div></div>" },
          { test: "wow" },
          { test: "baz", html: '<p class="x"></p>', init: () => null },
          { test: "lol" }
        ].map(pass => ({
          ...options,
          html: pass.html || options.html,
          init: pass.init || options.init,
          pass
        }))
      );

      assert.equal(
        dom.window.document.getElementById("test").innerHTML,
        '<div>foo</div><p>wow</p><p class="x"></p><p>lol</p><p>lel</p>'
      );
    });
  });
});
