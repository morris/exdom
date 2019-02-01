const assert = require("assert");
const { JSDOM } = require("jsdom");

const {
  setChildren,
  setChild,
  listen
} = require('../src');

describe('From the render module,', () => {

  describe('setChild', () => {

    it('should set a child', () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      let init = false;
      let data;

      setChild(
        dom.window.document.getElementById('test'),
        {
          html: '<p>test</p>',
          init: el => {
            init = true;
            assert.equal(el.tagName, 'P');
            assert.equal(el.innerHTML, 'test');

            listen(el, 'data', e => {
              data = e.detail;
            });
          }
        },
        {
          data: {
            foo: 'bar'
          }
        }
      );

      assert.ok(init);
      assert.deepStrictEqual(data, {
        foo: 'bar'
      });
    });

  });

});
