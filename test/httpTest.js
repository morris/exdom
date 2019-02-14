/* eslint-env node, mocha */
import * as assert from "assert";
import { JSDOM } from "jsdom";
import express from "express";
import { json as bodyParserJson } from "body-parser";
import { readFileSync } from "fs";

import { request, observe } from "../src";

describe("From the http module,", () => {
  describe("request", () => {
    let app, server, dom, el;

    before(done => {
      app = express();

      app.get("/hello", (req, res) => {
        res.json({
          hello: "world"
        });
      });

      app.post("/echo", bodyParserJson(), (req, res) => {
        res.json(req.body);
      });

      app.get("/not-found", bodyParserJson(), (req, res) => {
        res
          .status(404)
          .type("text/html")
          .end("<h1>Not found</h1>");
      });

      server = app.listen(3999, done);

      const fetchPolyfill = readFileSync(
        require.resolve("whatwg-fetch/dist/fetch.umd.js")
      ).toString("utf-8");

      dom = new JSDOM(
        `
        <!DOCTYPE html>
        <div id="test"></div>
        <script>${fetchPolyfill}</script>
      `,
        { url: "http://localhost:3999", runScripts: "dangerously" }
      );

      el = dom.window.document.getElementById("test");
    });

    it("should get json (auto)", async () => {
      const events = [];

      observe(el, $request => {
        events.push($request);
      });

      observe(el, $response => {
        events.push($response);
      });

      observe(el, $fullResponse => {
        events.push($fullResponse);
      });

      const { req, res, body } = await request(el, {
        url: "http://localhost:3999/hello"
      });

      assert.deepEqual(req, {
        url: "http://localhost:3999/hello",
        headers: {
          map: {}
        },
        body: undefined,
        read: "auto"
      });

      assert.equal(res.status, 200);

      assert.deepEqual(body, {
        hello: "world"
      });

      assert.equal(events.length, 3);
      assert.ok(events[1].req && events[1].res);
      assert.ok(events[2].req && events[2].res && events[2].body);
    });

    it("should post json", async () => {
      const { req, body } = await request(el, {
        method: "POST",
        url: "http://localhost:3999/echo",
        body: {
          foo: "bar"
        },
        read: "json"
      });

      assert.deepEqual(req, {
        method: "POST",
        url: "http://localhost:3999/echo",
        headers: {
          map: {
            accept: "application/json",
            "content-type": "application/json"
          }
        },
        body: '{"foo":"bar"}',
        read: "json"
      });

      assert.deepEqual(body, {
        foo: "bar"
      });
    });

    it("should handle errors", async () => {
      const events = [];
      observe(el, $requestError => {
        events.push($requestError);
      });

      try {
        await request(
          el,
          {
            url: "http://localhost:3999/not-found",
            headers: {
              foo: "bar"
            }
          },
          {
            headers: {
              foo: "baz"
            }
          }
        );
        assert.ok(false, "should have thrown");
      } catch (err) {
        assert.deepEqual(err.req, {
          url: "http://localhost:3999/not-found",
          headers: {
            map: {
              foo: "baz"
            }
          },
          body: undefined,
          read: "auto"
        });
        assert.equal(err.res.status, 404);
        assert.ok(err.message.indexOf("404") >= 0);
        assert.deepEqual(err.body, "<h1>Not found</h1>");
        assert.equal(events.length, 1);
        assert.equal(events[0].message, "Status code error 404");
      }
    });

    after(() => {
      server.close();
    });
  });
});
