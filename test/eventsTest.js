/* eslint-env node, mocha */
import * as assert from "assert";
import { createFixture } from "./testHelpers";
import { listen, emit } from "../src/events";

describe("Exdom", () => {
  describe(".on", () => {
    it("should observe events and call the handler correctly", () => {
      const { $ } = createFixture();
      const calls = [];

      $.on("foo bar baz", ({ foo, bar, baz, $event }) => {
        assert.ok($event);
        calls.push([foo, bar, baz]);
      });

      $.send("foo", 1);
      $.send("bar", 2);
      $.send("baz", 3);

      assert.deepStrictEqual(calls, [
        [1, undefined, undefined],
        [1, 2, undefined],
        [1, 2, 3]
      ]);
    });

    it("should observe volatile events and call the handler correctly", () => {
      const { $ } = createFixture();
      const calls = [];

      $.on("foo bar $baz", d => {
        calls.push([d.foo, d.bar, d.baz]);
      });

      $.send("foo", 1);
      $.send("bar", 2);
      $.send("baz", 3);
      $.send("foo", 4);
      $.send("bar", 5);

      assert.deepStrictEqual(calls, [[1, 2, 3]]);
    });

    it("should handle selector delegation properly", () => {
      const { $ } = createFixture(
        `<!DOCTYPE html><div id="test">div#test<p>p</p><p class="foo">p.foo</p></div>`
      );
      const calls = [];

      $.on("$foo bar @ p", d => {
        calls.push([d.foo, d.bar]);
      });

      $.on("$foo bar @ p:first-child", d => {
        calls.push([d.foo, d.bar]);
      });

      $.on("$foo bar @ .foo", d => {
        calls.push([d.foo, d.bar]);
      });

      $.emit("foo", 1);
      $.find("p").emit("foo", 2);
      $.find("p:first-child").emit("foo", 3);
      $.find("p:nth-child(1)").emit("foo", 4);

      $.find("p").emit("bar", 5);

      $.emit("foo", 1);
      $.find("p").emit("foo", 2);
      $.find("p:first-child").emit("foo", 3);
      $.find("p:nth-child(1)").emit("foo", 4);

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
      const { $ } = createFixture(
        `<!DOCTYPE html><div id="test">div#test<p>p</p><p class="foo">p.foo</p></div>`
      );
      const calls = [];

      $.on("foo", async d => {
        calls.push(await d.foo);
      });

      const foop = new Promise(resolve =>
        setTimeout(() => resolve("foo"), 200)
      );
      const barp = new Promise(resolve =>
        setTimeout(() => resolve("bar"), 100)
      );

      $.send("foo", foop);
      $.send("foo", barp);

      await foop;
      await barp;

      assert.deepEqual(calls, ["bar", "foo"]);
    });
  });

  describe("emit", () => {
    it("should work with window", () => {
      const { dom } = createFixture(
        `<!DOCTYPE html><div id="test">div#test<p>p</p><p class="foo">p.foo</p></div>`
      );
      let ok = false;

      listen(dom.window, "test", () => {
        ok = true;
      });

      emit(dom.window, "test");

      assert.ok(ok, "didn't work");
    });
  });
});
