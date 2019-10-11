/* eslint-env node */
import { JSDOM } from "jsdom";
import { exdom } from "../src/exdom";

export function createFixture(html, done) {
  const dom = new JSDOM(html || `<!DOCTYPE html><div id="test"></div>`, {
    url: "http://localhost:3999",
    runScripts: "dangerously"
  });

  dom.window.requestAnimationFrame = fn => {
    setImmediate(fn);
  };

  dom.window.addEventListener("error", e => {
    done(e.detail);
  });

  const $ = exdom([dom.window.document.getElementById("test")]);

  return { dom, $ };
}
