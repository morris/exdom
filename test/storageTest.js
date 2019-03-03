/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { observe, emit, localValue } from "../src";

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
  });
});
