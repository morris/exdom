const assert = require("assert");
const { JSDOM } = require("jsdom");

const {
  observe,
  send
} = require('../src');

describe('From the events module,', () => {

  describe('observe', () => {

    it('should observe events and call the handler correctly', () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById('test');
      const calls = [];

      observe(test, (foo, bar, baz) => {
        calls.push([foo, bar, baz]);
      });

      send(test, 'foo', 1);
      send(test, 'bar', 2);
      send(test, 'baz', 3);

      assert.deepStrictEqual(calls, [
        [1, undefined, undefined],
        [1, 2, undefined],
        [1, 2, 3]
      ]);
    });

    it('should observe events and call the handler once if defer is set', done => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="test"></div>`);
      const test = dom.window.document.getElementById('test');
      const calls = [];

      observe(test, { defer: 1 }, (foo, bar, baz) => {
        calls.push([foo, bar, baz]);
      });

      send(test, 'foo', 1);
      send(test, 'bar', 2);
      send(test, 'baz', 3);

      setTimeout(() => {
        assert.deepStrictEqual(calls, [
          [1, 2, 3]
        ]);
        done();
      }, 1);
    });

  });

});
