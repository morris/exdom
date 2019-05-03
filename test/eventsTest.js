/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { observe, send, emit } from "../src";

describe("From the events module,", () => {
  describe("observe", () => {
    it("should observe events and call the handler correctly", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");
      const calls = [];

      observe(test, (foo, bar, baz) => {
        calls.push([foo, bar, baz]);
      });

      send(test, "foo", 1);
      send(test, "bar", 2);
      send(test, "baz", 3);

      assert.deepStrictEqual(calls, [
        [1, undefined, undefined],
        [1, 2, undefined],
        [1, 2, 3]
      ]);
    });

    it("should observe events and call the handler with combined data if defer is set", done => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");
      const calls = [];

      observe(test, { defer: 1 }, (foo, bar, baz) => {
        calls.push([foo, bar, baz]);
      });

      send(test, "foo", 1);
      send(test, "bar", 2);
      send(test, "baz", 3);

      setTimeout(() => {
        assert.deepStrictEqual(calls, [[1, 2, 3]]);
        done();
      }, 1);
    });

    it("should observe volatile events and call the handler correctly", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");
      const calls = [];

      observe(test, (foo, bar, $baz) => {
        calls.push([foo, bar, $baz]);
      });

      send(test, "foo", 1);
      send(test, "bar", 2);
      send(test, "baz", 3);
      send(test, "foo", 4);
      send(test, "bar", 5);

      assert.deepStrictEqual(calls, [[1, 2, 3]]);
    });

    it("should observe full events and call the handler correctly", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById("test");
      const calls = [];

      observe(test, (foo, bar, _baz) => {
        assert.equal(_baz.detail, 3);
        calls.push([foo, bar, _baz]);
      });

      send(test, "foo", 1);
      send(test, "bar", 2);
      send(test, "baz", 3);
      send(test, "foo", 4);
      send(test, "bar", 5);

      assert.deepStrictEqual(calls, [
        [1, 2, new dom.window.CustomEvent("baz", {})]
      ]);
    });

    it("should validate the target option if given (volatile only)", () => {
      const dom = new JSDOM(
        `<!DOCTYPE html><div id="test">div#test<p>p</p><p class="foo">p.foo</p></div>`
      );
      const test = dom.window.document.getElementById("test");
      const calls = [];
      const p = test.getElementsByTagName("p");

      observe(test, { target: p }, ($foo, bar) => {
        calls.push([$foo, bar]);
      });

      observe(test, { target: p[0] }, ($foo, bar) => {
        calls.push([$foo, bar]);
      });

      observe(test, { targetClass: "foo" }, ($foo, bar) => {
        calls.push([$foo, bar]);
      });

      emit(test, "foo", 1);
      emit(p, "foo", 2);
      emit(p[0], "foo", 3);
      emit(p[1], "foo", 4);

      emit(test, "bar", 5);

      emit(test, "foo", 1);
      emit(p, "foo", 2);
      emit(p[0], "foo", 3);
      emit(p[1], "foo", 4);

      assert.deepEqual(calls, [
        [2, undefined],
        [2, undefined],
        [2, undefined],
        [2, undefined],
        [3, undefined],
        [3, undefined],
        [4, undefined],
        [4, undefined],
        [2, 5],
        [2, 5],
        [2, 5],
        [2, 5],
        [3, 5],
        [3, 5],
        [4, 5],
        [4, 5]
      ]);
    });

    it("should work with async functions (with explicit types)", async () => {
      const dom = new JSDOM(
        `<!DOCTYPE html><div id="test">div#test<p>p</p><p class="foo">p.foo</p></div>`
      );
      const test = dom.window.document.getElementById("test");
      const calls = [];

      observe(test, "foo", async foo => {
        calls.push(await foo);
      });

      const foop = new Promise(resolve =>
        setTimeout(() => resolve("foo"), 200)
      );
      const barp = new Promise(resolve =>
        setTimeout(() => resolve("bar"), 100)
      );

      send(test, "foo", foop);
      send(test, "foo", barp);

      await foop;
      await barp;

      assert.deepEqual(calls, ["bar", "foo"]);
    });
  });
});
