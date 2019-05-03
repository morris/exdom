/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { observe, emit, localValue, send } from "../src";

describe("From the storage module,", () => {
  describe("localValue", () => {
    it("should read/write event details to localStorage", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`, {
        url: "http://localhost:3999",
        runScripts: "dangerously"
      });
      const test = dom.window.document.getElementById("test");

      const foos = [];

      observe(test, $foo => {
        foos.push($foo);
      });

      localValue(test, "foo", { bar: 1 });

      emit(test, "readStorage");

      emit(test, "foo", { bar: 2 });

      assert.deepEqual(foos, [{ bar: 1 }, { bar: 2 }]);
      assert.deepEqual(JSON.parse(dom.window.localStorage.foo), { bar: 2 });

      emit(test, "foo", { bar: 3 });

      assert.deepEqual(JSON.parse(dom.window.localStorage.foo), { bar: 3 });

      emit(test, "readStorage");
      assert.deepEqual(foos, [{ bar: 1 }, { bar: 2 }, { bar: 3 }, { bar: 3 }]);
    });

    it("should handle multiple keys when given an object", () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`, {
        url: "http://localhost:3999",
        runScripts: "dangerously"
      });
      const test = dom.window.document.getElementById("test");
      const results = [];

      localValue(test, {
        foo: "foo",
        bar: "bar"
      });

      observe(test, (foo, bar) => {
        results.push([foo, bar]);
      });

      send(test, "readStorage");
      send(test, "foo", "baz");

      assert.deepEqual(results, [
        ["foo", undefined],
        ["foo", "bar"],
        ["baz", "bar"]
      ]);

      assert.equal(JSON.parse(dom.window.localStorage.foo), "baz");
      assert.equal(JSON.parse(dom.window.localStorage.bar), "bar");
    });
  });
});
