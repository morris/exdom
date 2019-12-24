/* eslint-env node, mocha */
import * as assert from "assert";
import { createFixture } from "./testHelpers";

describe("A user", () => {
  it("should be able to store/restore event details to/from localStorage", () => {
    const { $, dom } = createFixture();

    const foos = [];

    $.storeLocal("foo");

    $.on("foo", d => {
      foos.push(d.foo);
    });

    $.restoreLocal("foo", { bar: 1 });

    $.emit("foo", { bar: 2 });

    assert.deepEqual(foos, [{ bar: 1 }, { bar: 2 }]);
    assert.deepEqual(JSON.parse(dom.window.localStorage.foo), { bar: 2 });

    $.emit("foo", { bar: 3 });

    assert.deepEqual(JSON.parse(dom.window.localStorage.foo), { bar: 3 });

    assert.deepEqual(foos, [{ bar: 1 }, { bar: 2 }, { bar: 3 }]);
  });

  it("should be able to store/restore event details when providing an object", () => {
    const { $, dom } = createFixture();
    const results = [];

    $.storeLocal(["foo", "bar"]);

    $.on("foo, bar", d => {
      results.push([d.foo, d.bar]);
    });

    $.restoreLocal({
      foo: "foo",
      bar: "bar"
    });

    $.send("foo", "baz");

    assert.deepEqual(results, [
      ["foo", undefined],
      ["foo", "bar"],
      ["baz", "bar"]
    ]);

    assert.equal(JSON.parse(dom.window.localStorage.foo), "baz");
    assert.equal(JSON.parse(dom.window.localStorage.bar), "bar");
  });
});
