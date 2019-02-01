(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.XD = {}));
}(this, function (exports) { 'use strict';

  function getRefs(els, classNames, prefix) {
    const refs = {};

    forEach(els, el => {
      classNames.forEach(className => {
        refs[className] = [];
        forEach(el.getElementsByClassName(prefix + className), el_ => {
          refs[className].push(el_);
        });
      });
    });

    return refs;
  }

  function escapeHtml(text, context) {
    const tempEl = getTempEl(context);
    tempEl.innerText = text;
    return tempEl.innerHTML;
  }

  function parseEl(html, context) {
    if (typeof html === "string") {
      const tempEl = getTempEl(context);
      tempEl.innerHTML = html;
      return tempEl.firstElementChild;
    }

    return html;
  }

  function getWindow(els) {
    const doc = els.ownerDocument || els[0].ownerDocument;
    return doc.defaultView || doc.parentWindow;
  }

  function hasClass(els, className) {
    const tmp = map(els, el => (el.className ? el.className.split(/\s+/g) : []));
    return (
      tmp.filter(classNames => classNames.indexOf(className) >= 0).length ===
      tmp.length
    );
  }

  const BREAK = {};

  function forEach(list, fn) {
    if (list && list.addEventListener) list = [list];
    if (!list) list = [];
    for (let i = 0, l = list.length; i < l; ++i) {
      if (fn(list[i], i) === BREAK) return list;
    }
    return list;
  }

  function map(list, fn) {
    if (list && list.addEventListener) list = [list];
    if (!list) list = [];
    const result = [];
    for (let i = 0, l = list.length; i < l; ++i) {
      result.push(fn(list[i], i));
    }
    return result;
  }

  function filter(list, fn) {
    if (list && list.addEventListener) list = [list];
    if (!list) list = [];
    const result = [];
    for (let i = 0, l = list.length; i < l; ++i) {
      if (fn(list[i], i)) result.push(list[i]);
    }
    return result;
  }

  //

  let _tempEl;

  function getTempEl(context) {
    const doc = context.ownerDocument || context[0].ownerDocument;
    if (!_tempEl) _tempEl = doc.createElement("div");
    return _tempEl;
  }

  function observe(els, options1, options2) {
    const o = {
      ...(typeof options1 === "function" ? { action: options1 } : options1),
      ...(typeof options2 === "function" ? { action: options2 } : options2)
    };

    let hasVolatile = false;

    const types = (o.types || parseArgumentNames(o.action)).map(name => {
      const full = name[0] === "_";
      const volatile = full || name[0] === "$";

      if (volatile) hasVolatile = true;

      return {
        name: volatile ? name.slice(1) : name,
        volatile,
        full
      };
    });

    forEach(els, el => {
      const cache = [];
      cache.length = types.length;

      let deferTimeout;

      types.forEach((type, index) => {
        listen(el, type.name, e => {
          if (!type.volatile) cache[index] = type.full ? e : e.detail;

          if (!hasVolatile || type.volatile) {
            if (o.defer) {
              clearTimeout(deferTimeout);
              deferTimeout = setTimeout(applyAction, o.defer);
            } else {
              applyAction();
            }
          }

          function applyAction() {
            if (type.volatile) {
              const args = cache.slice(0);
              args[index] = type.full ? e : e.detail;
              o.action.apply(null, args);
            } else {
              o.action.apply(null, cache);
            }
          }
        });
      });
    });
  }

  function relay(els, type, targets) {
    listen(els, type, e => {
      send(targets, type, e.detail);
    });
  }

  function listen(els, type, listener, options) {
    forEach(els, el => {
      el.addEventListener(
        type,
        e => {
          try {
            return listener(e);
          } catch (ex) {
            emit(el, "error", ex);
          }
        },
        options || false
      );
    });
  }

  function send(els, type, detail) {
    if (!els || (!els.ownerDocument && els.length === 0)) return;

    const { CustomEvent } = getWindow(els);

    dispatch(
      els,
      new CustomEvent(type, {
        detail: arguments.length === 2 ? {} : detail,
        bubbles: false
      })
    );
  }

  function emit(els, type, detail) {
    if (!els || (!els.ownerDocument && els.length === 0)) return;

    const { CustomEvent } = getWindow(els);

    dispatch(
      els,
      new CustomEvent(type, {
        detail: arguments.length === 2 ? {} : detail,
        bubbles: true
      })
    );
  }

  function dispatch(els, e) {
    forEach(els, el => {
      el.dispatchEvent(e);
    });
  }

  //

  function parseArgumentNames(fn) {
    const m = fn
      .toString()
      .match(/^function[^(]*\(([^)]*)\)|^\(([^)]*)\)|^([a-zA-Z$_][^=]*)/);
    const args = m[1] || m[2] || m[3];

    return args
      .split(",")
      .map(arg => arg.trim())
      .filter(arg => !!arg);
  }

  function getValue(els) {
    const el = els && els.addEventListener ? els : els[0];

    if (!el) return;

    switch (el.tagName === "INPUT" ? el.type : el.tagName) {
      case "text":
      case "password":
      case "SELECT":
        return el.value || "";
      case "TEXTAREA":
        return el.value;
      case "checkbox":
        return !!el.checked;
      default:
        return;
    }
  }

  function setValue(els, value) {
    forEach(els, el => {
      const tagName = el.tagName;
      const val = toValue(value);
      let elValue, multiple;

      switch (tagName === "INPUT" ? el.type : tagName) {
        case "text":
        case "password":
        case "TEXTAREA":
          if (el.value !== val + "") el.value = val;
          break;
        case "checkbox":
          elValue = el.getAttribute("value") || "on";
          el.checked = Array.isArray(val)
            ? value.indexOf(elValue) >= 0
            : val === elValue;
          break;
        case "radio":
          // TODO
          break;
        case "SELECT":
          multiple = el.multiple && Array.isArray(val);

          forEach(el.options, option => {
            const optionValue = option.value || option.textContent;
            option.selected = multiple
              ? value.indexOf(optionValue) >= 0
              : value + "" == optionValue;
          });

          break;
      }
    });
  }

  function toValue(value) {
    if (value === null || value === undefined || value === false) return "";
    if (value === true) return "on";
    if (Array.isArray(value)) return value.map(toValue);
    return value + "";
  }

  function setChildren(els, optionsArray, extraOptions) {
    forEach(els, el => {
      optionsArray.forEach((options, index) => {
        setChild(el, options, { ...extraOptions, index });
      });
    });
  }

  function setChild(els, options, extraOptions) {
    const o = {
      ...(typeof options === "string" ? { html: options } : options),
      ...extraOptions
    };

    const index = o.index || 0;
    const tail = o.tail || 0;
    const compat = o.compatible || compatible;

    forEach(els, el => {
      const { Event, CustomEvent } = getWindow(el);
      const proto = o.proto || (o.html && getProto(o.html, el));
      const maxIndex = el.children.length - tail;

      if (index > maxIndex) {
        throw new Error(
          `Cannot render child element at index ${index} of ${
          el.children.length
        } children and tail ${tail}`
        );
      }

      // reconciliation
      const childAtIndex = el.children[index];
      let child;

      if (!proto) {
        // if no prototype element was given,
        // there must be an existing child to init/update
        if (!childAtIndex) {
          throw new Error(
            `Cannot render new child element at index ${index} without base html`
          );
        }

        child = childAtIndex;
      } else if (index === maxIndex) {
        // otherwise if index is maxIndex, must insert
        child = cloneProto(proto);
        el.insertBefore(child, childAtIndex);
      } else if (!compat(childAtIndex, proto)) {
        // otherwise, index < maxIndex <= el.children.length is guaranteed,
        // so childAtIndex is too;
        // must replace unless existing child is compatible
        // also send destroy event to existing child
        child = cloneProto(proto);
        childAtIndex.dispatchEvent(
          new Event("destroy", {
            bubbles: false
          })
        );
        el.replaceChild(child, childAtIndex);
      } else {
        // finally, if child is compatible with prototype, dont insert/replace,
        // just init and update existing child
        child = childAtIndex;
      }

      // init child once
      if (o.init && !child.__init) {
        child.__init = true;
        o.init(child);
      }

      // pass data, if any
      if (o.data) {
        child.dispatchEvent(
          new CustomEvent("data", {
            detail: o.data,
            bubbles: false
          })
        );
      }
    });
  }

  function setText(els, text) {
    forEach(els, el => {
      if (el.__text !== text) {
        el.__text = text;
        // safe guard if setText() and setHtml() are used on the same element
        el.__html = {};
        el.innerText = text;
      }
    });
  }

  function setHtml(els, html) {
    forEach(els, el => {
      if (el.__html !== html) {
        el.__html = html;
        // see above
        el.__text = {};
        el.innerHTML = html;
      }
    });
  }

  function setAttr(els, name, value) {
    forEach(els, el => {
      if (!el.__attr) el.__attr = {};
      if (!el.__attr.hasOwnProperty(name) || el.__attr[name] !== value) {
        el.__attr[name] = value;
        if (typeof value === "undefined" || value === null) {
          el.removeAttribute(name, value);
        } else {
          el.setAttribute(name, value);
        }
      }
    });
  }

  function setClass(els, classNames, condition) {
    const list = classNames.split(/\s+/g);

    forEach(els, el => {
      let changed = false;
      const result = el.className.split(/\s+/g).filter(className => !!className);
      list.forEach(className => {
        const index = result.indexOf(className);
        if (condition && index === -1) {
          result.push(className);
          changed = true;
        } else if (!condition && index >= 0) {
          result.splice(index, 1);
          changed = true;
        }
      });
      if (changed) el.className = result.join(" ");
    });
  }

  //

  function compatible(el, proto) {
    return (
      el.__proto === proto ||
      (el.tagName === proto.tagName && el.className === proto.className)
    );
  }

  function cloneProto(proto) {
    const el = proto.cloneNode(true);
    el.__proto = proto;

    return el;
  }

  const protoCache = new Map();

  function getProto(html, context) {
    let proto = protoCache.get(html);
    if (!proto) {
      proto = parseEl(html, context);
      protoCache.set(html, proto);
    }

    return proto;
  }

  exports.observe = observe;
  exports.relay = relay;
  exports.listen = listen;
  exports.send = send;
  exports.emit = emit;
  exports.dispatch = dispatch;
  exports.getValue = getValue;
  exports.setValue = setValue;
  exports.toValue = toValue;
  exports.setChildren = setChildren;
  exports.setChild = setChild;
  exports.setText = setText;
  exports.setHtml = setHtml;
  exports.setAttr = setAttr;
  exports.setClass = setClass;
  exports.getRefs = getRefs;
  exports.escapeHtml = escapeHtml;
  exports.parseEl = parseEl;
  exports.getWindow = getWindow;
  exports.hasClass = hasClass;
  exports.BREAK = BREAK;
  exports.forEach = forEach;
  exports.map = map;
  exports.filter = filter;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
