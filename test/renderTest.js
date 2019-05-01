/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { listen } from "../src/events";
import {
  appendChildren,
  appendChild,
  endChildren,
  setHtml
} from "../src/render";

describe("From the render module,", () => {
  describe("appendChild", () => {
    it("should append a child", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");
      let init = false;
      let pass;

      appendChild(
        test,
        {
          template: "<p>test</p>",
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

    it("should append a table row", () => {
      const dom = new JSDOM(
        `<!DOCTYPE html><table><tbody id="test"></tbody></table>`
      );
      const test = dom.window.document.getElementById("test");
      let init = false;

      appendChild(test, {
        template: "<tr><td>test</td></tr>",
        init: el => {
          init = true;
          assert.equal(el.tagName, "TR");
          assert.equal(el.innerHTML, "<td>test</td>");
        }
      });

      assert.ok(init);
    });

    it("should append children in different combinations", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");

      const A = { template: "<div>a</div>" };
      const B = { template: "<div><p>b</p></div>" };

      appendChild(test, A);
      appendChild(test, B);
      endChildren(test);

      assert.equal(test.innerHTML, "<div>a</div><div><p>b</p></div>");

      appendChild(test, B);
      appendChild(test, A);
      endChildren(test);

      assert.equal(test.innerHTML, "<div><p>b</p></div><div>a</div>");

      appendChild(test, A);
      endChildren(test);

      assert.equal(test.innerHTML, "<div>a</div>");

      appendChild(test, B);
      endChildren(test);

      assert.equal(test.innerHTML, "<div><p>b</p></div>");
    });
  });

  describe("appendChildren", () => {
    it("should append multiple children", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");

      const options = {
        template: "<p>lel</p>",
        init: el => {
          listen(el, "pass", e => {
            setHtml(el, e.detail.test);
          });
        }
      };

      appendChildren(
        test,
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

      endChildren(test);

      assert.equal(test.innerHTML, "<p>foo</p><p>bar</p><p>baz</p><p>lol</p>");

      appendChildren(
        test,
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

      endChildren(test);

      assert.equal(
        test.innerHTML,
        "<p>foo</p><p>wow</p><p>baz</p><p>lol</p><p>lel</p>"
      );

      appendChildren(
        test,
        [
          { test: "foo", template: "<div></div>" },
          { test: "wow" },
          { test: "baz", template: '<p class="x"></p>', init: () => null },
          { test: "lol" }
        ].map(pass => ({
          ...options,
          template: pass.template || options.template,
          init: pass.init || options.init,
          pass
        }))
      );

      endChildren(test);

      assert.equal(
        test.innerHTML,
        '<div>foo</div><p>wow</p><p class="x"></p><p>lol</p>'
      );
    });

    it("should remove obsolete children", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");

      const options = {
        template: "<p>lel</p>",
        init: el => {
          listen(el, "pass", e => {
            setHtml(el, e.detail.test);
          });
        }
      };

      appendChildren(
        test,
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

      endChildren(test);

      assert.equal(test.innerHTML, "<p>foo</p><p>bar</p><p>baz</p><p>lol</p>");

      appendChildren(
        test,
        [{ test: "foo" }, { test: "bar" }].map(pass => ({
          ...options,
          pass
        }))
      );

      endChildren(test);

      assert.equal(test.innerHTML, "<p>foo</p><p>bar</p>");
    });
  });
});
