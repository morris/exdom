const assert = require("assert");
const { JSDOM } = require("jsdom");

const { setChildren, setChild, listen, setHtml } = require("../src");

describe("From the render module,", () => {
  describe("setChild", () => {
    it("should render a child", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      let init = false;
      let data;

      setChild(
        dom.window.document.getElementById("test"),
        {
          html: "<p>test</p>",
          init: el => {
            init = true;
            assert.equal(el.tagName, "P");
            assert.equal(el.innerHTML, "test");

            listen(el, "data", e => {
              data = e.detail;
            });
          }
        },
        {
          data: {
            foo: "bar"
          }
        }
      );

      assert.ok(init);
      assert.deepStrictEqual(data, {
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
          listen(el, "data", e => {
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
        ].map(data => ({
          ...options,
          data
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
        ].map(data => ({
          ...options,
          data
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
          { test: "baz", html: '<p class="x"></p>', init: el => null },
          { test: "lol" }
        ].map(data => ({
          ...options,
          html: data.html || options.html,
          init: data.init || options.init,
          data
        }))
      );

      assert.equal(
        dom.window.document.getElementById("test").innerHTML,
        '<div>foo</div><p>wow</p><p class="x"></p><p>lol</p><p>lel</p>'
      );
    });
  });
});
