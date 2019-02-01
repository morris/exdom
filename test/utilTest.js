const assert = require("assert");
const { JSDOM } = require("jsdom");

const {
  getRefs
} = require('../src');

describe('From the util module,', () => {

  describe('getRefs', () => {

    it('should build a refs object', () => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <div id="test">
          <div class="-foo" id="foo">
            <p class="-bar" id="bar"></p>
            <p class="-bar -baz" id="bar-baz"></p>
          </div>
        </div>
      `);

      const refs = getRefs(dom.window.document.getElementById('test'), [
        'foo', 'bar', 'baz', 'x'
      ], '-');

      assert.equal(refs.foo[0], dom.window.document.getElementById('foo'));
      assert.equal(refs.bar[0], dom.window.document.getElementById('bar'));
      assert.equal(refs.bar[1], dom.window.document.getElementById('bar-baz'));
      assert.equal(refs.baz[0], dom.window.document.getElementById('bar-baz'));
      assert.equal(refs.x.length, 0);


    });

  });

});
