/* eslint-env node, mocha */
import * as assert from "assert";
import { createFixture } from "./testHelpers";

describe("Exdom", () => {
  describe(".value", () => {
    it("should get and set form input values", () => {
      const { $ } = createFixture(`
        <!DOCTYPE html>
        <div id="test">
          <input type="text" id="foo" value="bar">
        </div>
      `);

      assert.equal($.find("#foo").value(), "bar");

      $.find("#foo").value("baz");

      assert.equal($.find("#foo").value(), "baz");
    });

    it("should get and set form select values", () => {
      const { $ } = createFixture(`
        <!DOCTYPE html>
        <div id="test">
          <select id="foo">
            <option value="a">a</option>
            <option value="b" selected>a</option>
          </select>
        </div>
      `);

      assert.equal($.find("#foo").value(), "b");

      $.find("#foo").value("a");

      assert.equal($.find("#foo").value(), "a");
    });
  });
});
