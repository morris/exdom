/* eslint-env node, mocha */
import * as assert from "assert";
import { createFixture } from "./testHelpers";

describe("Exdom", () => {
  describe(".value", () => {
    it("should set and get form input values", () => {
      const { $ } = createFixture(`
        <!DOCTYPE html>
        <div id="test">
          <input type="text" id="foo">
        </div>
      `);

      $.find("#foo").value("test");

      assert.equal($.find("#foo").value(), "test");
    });
  });
});
