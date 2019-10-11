/* eslint-env node, mocha */
import * as assert from "assert";
import { createFixture } from "./testHelpers";

describe("Exdom", () => {
  describe(".children", () => {
    it("should render children", () => {
      const { $ } = createFixture(null);

      $.children([1, 2, 3], "<p></p>");
      assert.equal($.els[0].innerHTML, "<p></p><p></p><p></p>");

      $.children([1, 2], "<p></p>");
      assert.equal($.els[0].innerHTML, "<p></p><p></p>");

      $.children([1, 2, 3, 4], "<p></p>");
      assert.equal($.els[0].innerHTML, "<p></p><p></p><p></p><p></p>");

      $.children([
        { template: "<p>1</p>" },
        { template: "<div>2</div>" },
        { template: "<p>3</p>" }
      ]);

      assert.equal($.els[0].innerHTML, "<p>1</p><div>2</div><p>3</p>");
    });

    it("should render table rows", () => {
      const { $ } = createFixture(
        `<!DOCTYPE html><table id="test"><tbody></tbody></table>`
      );

      $.find("tbody").children([1, 2], "<tr><td></td></tr>");
      assert.equal(
        $.els[0].innerHTML,
        "<tbody><tr><td></td></tr><tr><td></td></tr></tbody>"
      );
    });

    it("should render and mount children", done => {
      const { $ } = createFixture();

      $.for("p", $ => {
        $.on("pass", ($, d) => {
          $.html(d.pass);
        });
      });

      $.children([1, 2, 3], "<p></p>");

      setTimeout(() => {
        assert.equal($.els[0].innerHTML, "<p>1</p><p>2</p><p>3</p>");

        $.children([1, 2], "<p></p>");

        setTimeout(() => {
          assert.equal($.els[0].innerHTML, "<p>1</p><p>2</p>");
          done();
        }, 100);
      }, 100);
    });
  });
});
