import { forEach, filter, BREAK } from "./util";
import { observe, send, emit } from "./events";
import { setAttr, setClass, setHtml, setText, setChildren } from "./render";
import { setValue, getValue } from "./forms";
import { request } from "./http";
import { find, matches, hasClass, getClosest } from "./selector";
import { mount } from "./mount";
import { store, restore } from "./storage";

export function exdom(els) {
  if (!els) return new Exdom([]);
  if (els.addEventListener) return new Exdom([els]);
  return new Exdom(els);
}

export class Exdom {
  constructor(els) {
    this.els = els;
  }

  // mounting

  for(selector, body) {
    forEach(this.els, el =>
      mount(el, selector, el => body(new this.constructor([el])))
    );
  }

  // selector

  find(selector) {
    const results = [];

    forEach(this.els, el => {
      results.push.apply(results, find(el, selector));
    });

    return new this.constructor(results);
  }

  matches(selector) {
    let result = false;

    forEach(this.els, el => {
      if (matches(el, selector)) {
        result = true;
      } else {
        result = false;
        return BREAK;
      }
    });

    return result;
  }

  hasClass(className) {
    let result = false;

    forEach(this.els, el => {
      if (hasClass(el, className)) {
        result = true;
      } else {
        result = false;
        return BREAK;
      }
    });

    return result;
  }

  closest(selector) {
    const results = [];

    forEach(this.els, el => {
      const closest = getClosest(el, selector);
      if (closest) results.push(closest);
    });

    return new this.constructor(results);
  }

  // util

  forEach(fn) {
    forEach(this.els, (el, index) => fn(new this.constructor([el]), index));

    return this;
  }

  filter(fn) {
    if (typeof fn === "string") {
      return new this.constructor(filter(this.els, el => matches(el, fn)));
    }

    return new this.constructor(
      filter(this.els, (el, index) => fn(new this.constructor([el]), index))
    );
  }

  // render

  children(data, templateSelector) {
    forEach(this.els, el => {
      let pass = data;

      if (templateSelector) {
        setChildren(el, templateSelector, data.length);
      } else {
        setChildren(el, data.map(it => it.template));
        pass = data.map(it => it.pass);
      }

      for (let i = 0, l = el.children.length; i < l; ++i) {
        const child = el.children[i];
        child.__pass = pass[i];
        send(child, "pass", pass[i]);
      }
    });

    return this;
  }

  attr(key, value) {
    forEach(this.els, el => setAttr(el, key, value));

    return this;
  }

  classes(classNames, condition) {
    forEach(this.els, el => setClass(el, classNames, condition));

    return this;
  }

  html(html) {
    forEach(this.els, el => setHtml(el, html));

    return this;
  }

  text(text) {
    forEach(this.els, el => setText(el, text));

    return this;
  }

  // forms

  value(value) {
    if (arguments.length === 0) {
      if (this.els.length === 0) return undefined;

      return getValue(this.els[0]);
    }

    forEach(this.els, el => setValue(el, value));

    return this;
  }

  // events

  on(eventSelectors, handler) {
    forEach(this.els, el => observe(el, eventSelectors, handler));

    return this;
  }

  emit(type, detail) {
    forEach(this.els, el => emit(el, type, detail));

    return this;
  }

  send(type, detail) {
    forEach(this.els, el => send(el, type, detail));

    return this;
  }

  // http

  request(options, extra) {
    if (this.els.length !== 1) {
      console.warn(
        `Called request() on an element scope with ${this.els.length} elements`
      );
      return this;
    }

    return request(this.els[0], options, extra);
  }

  // deferred

  timeout(ms, fn) {
    return setTimeout(() => fn(this), ms);
  }

  interval(ms, fn) {
    return setInterval(() => fn(this), ms);
  }

  // storage

  storeLocal(key) {
    forEach(this.els, el => store(el, 'localStorage', key));
    return this;
  }

  storeSession(key) {
    forEach(this.els, el => store(el, 'sessionStorage', key));
    return this;
  }

  restoreLocal(key, def) {
    forEach(this.els, el => restore(el, 'localStorage', key, def));
    return this;
  }

  restoreSession(key, def) {
    forEach(this.els, el => restore(el, 'sessionStorage', key, def));
    return this;
  }
}
