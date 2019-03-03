/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";

import { setValue, getValue } from "../src/forms";

describe("From the forms module,", () => {
  describe("setValue and getValue", () => {
    it("should set and get form input values", () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <div id="test">
          <input type="text" id="foo">
        </div>
      `);
      const document = dom.window.document;
      const foo = document.getElementById("foo");

      setValue(foo, "test");

      assert.equal(getValue(foo), "test");
    });
  });
});
