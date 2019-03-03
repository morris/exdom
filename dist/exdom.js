(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.XD = {}));
}(this, function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function getRefs(els, prefix, inputRefs) {
    var refs = inputRefs || {};
    forEach(els, function (el) {
      if (el.className) {
        el.className.split(/\s+/g).map(function (className) {
          var refName;

          if (prefix) {
            if (className.indexOf(prefix) !== 0) return;
            refName = camelCase(className.slice(prefix.length));
          } else {
            refName = camelCase(className);
          }

          if (!refs[refName]) {
            refs[refName] = [el];
          } else {
            refs[refName].push(el);
          }
        });
      }

      getRefs(el.children, prefix, refs);
    });
    return refs;
  }
  function getClosestOfClass(els, className) {
    var el = firstOf(els);
    var current = el;

    while (current) {
      if (hasClass(current, className)) return current;
      current = current.parentNode;
    }
  }
  function contain(els, target) {
    var els_ = listOf(els);

    for (var i = 0, l = els_.length; i < l; ++i) {
      var current = target;

      while (current) {
        if (current === els_[i]) return true;
        current = current.parentNode;
      }
    }

    return false;
  }
  function escapeHtml(context, text) {
    var tempEl = getTempEl(context);
    tempEl.innerText = text;
    return tempEl.innerHTML;
  }
  function parseEl(context, html) {
    if (typeof html === "string") {
      var tempEl = getTempEl(context);
      tempEl.innerHTML = html;
      return tempEl.firstElementChild;
    }

    return html;
  }
  function getWindow(els) {
    var document = els.ownerDocument || els[0].ownerDocument;
    return document.defaultView || document.parentWindow;
  }
  function hasClass(els, className) {
    var tmp = map(els, function (el) {
      return el.className ? el.className.split(/\s+/g) : [];
    });
    return tmp.filter(function (classNames) {
      return classNames.indexOf(className) >= 0;
    }).length === tmp.length;
  }
  var BREAK = {};
  function forEach(els, fn) {
    var els_ = listOf(els);

    for (var i = 0, l = els_.length; i < l; ++i) {
      if (fn(els_[i], i) === BREAK) return els_;
    }

    return els_;
  }
  function map(els, fn) {
    var els_ = listOf(els);
    var result = [];

    for (var i = 0, l = els_.length; i < l; ++i) {
      result.push(fn(els_[i], i));
    }

    return result;
  }
  function filter(els, fn) {
    var els_ = listOf(els);
    var result = [];

    for (var i = 0, l = els_.length; i < l; ++i) {
      var el = els_[i];
      if (fn(el, i)) result.push(el);
    }

    return result;
  }
  function indexOf(els, el) {
    var els_ = listOf(els);

    for (var i = 0, l = els_.length; i < l; ++i) {
      if (els_[i] === el) return i;
    }

    return -1;
  }
  function listOf(els) {
    if (!els) return [];
    if (els.addEventListener) return [els];
    return els;
  }
  function firstOf(els) {
    if (!els) return;
    if (els.addEventListener) return els;
    return els[0];
  } //

  var _tempEl;

  function getTempEl(context) {
    if (!_tempEl) {
      var document = context.ownerDocument || context[0].ownerDocument;
      _tempEl = document.createElement("div");
    }

    return _tempEl;
  }

  function camelCase(str) {
    return str.replace(/-+./g, function (m) {
      return m.slice(m.length - 1).toUpperCase();
    });
  }

  function observe(els, options, extra) {
    var o = _objectSpread({}, typeof options === "function" ? {
      handler: options
    } : options, typeof extra === "function" ? {
      handler: extra
    } : extra);

    var hasVolatile = false;
    var types = (o.types || parseArgumentNames(o.handler)).map(function (name) {
      var full = name[0] === "_";
      var volatile = full || name[0] === "$";
      if (volatile) hasVolatile = true;
      return {
        name: volatile ? name.slice(1) : name,
        volatile: volatile,
        full: full
      };
    });
    forEach(els, function (el) {
      var cache = [];
      cache.length = types.length;
      var deferTimeout;
      types.forEach(function (type, index) {
        listen(el, type.name, function (e) {
          if (type.volatile) {
            // delegation
            if (o.targetClass && !getClosestOfClass(e.target, o.targetClass)) {
              return;
            } else if (o.target && !contain(o.target, e.target)) {
              return;
            }
          } else {
            cache[index] = e.detail;
          }

          if (!hasVolatile || type.volatile) {
            if (o.defer) {
              clearTimeout(deferTimeout);
              deferTimeout = setTimeout(callHandler, o.defer);
            } else {
              callHandler();
            }
          }

          function callHandler() {
            if (type.volatile) {
              var args = cache.slice(0);
              args[index] = type.full ? e : e.detail;
              o.handler.apply(null, args);
            } else {
              o.handler.apply(null, cache);
            }
          }
        });
      });
    });
  }
  function relay(els, type, targets) {
    listen(els, type, function (e) {
      send(targets, type, e.detail);
    });
  }
  function listen(els, type, listener, options) {
    forEach(els, function (el) {
      el.addEventListener(type, function (e) {
        try {
          return listener(e);
        } catch (ex) {
          emit(el, "error", ex);
        }
      }, options || false);
    });
  }
  function send(els, type, detail) {
    if (!els || !els.addEventListener && els.length === 0) return;

    var _getWindow = getWindow(els),
        CustomEvent = _getWindow.CustomEvent;

    dispatch(els, new CustomEvent(type, {
      detail: arguments.length === 2 ? {} : detail,
      bubbles: false
    }));
  }
  function emit(els, type, detail) {
    if (!els || !els.addEventListener && els.length === 0) return;

    var _getWindow2 = getWindow(els),
        CustomEvent = _getWindow2.CustomEvent;

    dispatch(els, new CustomEvent(type, {
      detail: arguments.length === 2 ? {} : detail,
      bubbles: true
    }));
  }
  function dispatch(els, e) {
    forEach(els, function (el) {
      el.dispatchEvent(e);
    });
  } //

  function parseArgumentNames(fn) {
    var m = fn.toString().match(/^function[^(]*\(([^)]*)\)|^\(([^)]*)\)|^([a-zA-Z$_][^=]*)/);
    var args = m[1] || m[2] || m[3];
    return args.split(",").map(function (arg) {
      return arg.trim();
    }).filter(function (arg) {
      return !!arg;
    });
  }

  function getValue(els) {
    var el = firstOf(els);
    if (!el) return;

    switch (el.tagName === "INPUT" ? el.type : el.tagName) {
      case "checkbox":
      case "radio":
        return !!el.checked;

      default:
        // text, hidden, password, textarea, etc.
        return el.value || "";
    }
  }
  function setValue(els, value) {
    forEach(els, function (el) {
      var tagName = el.tagName;
      var val = toValue(value);
      var elValue, multiple;

      switch (tagName === "INPUT" ? el.type : tagName) {
        case "checkbox":
        case "radio":
          elValue = el.getAttribute("value") || "on";
          el.checked = Array.isArray(val) ? value.indexOf(elValue) >= 0 : val === elValue;
          break;

        case "SELECT":
          multiple = el.multiple && Array.isArray(val);
          forEach(el.options, function (option) {
            var optionValue = option.value || option.textContent;
            option.selected = multiple ? value.indexOf(optionValue) >= 0 : value + "" == optionValue;
          });
          break;

        case "OPTION":
        case "file":
        case "image":
        case "reset":
          break;

        default:
          // text, hidden, password, textarea, etc.
          if (el.value !== val + "") el.value = val;
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

  function request(els, options, extra) {
    var _getWindow = getWindow(els),
        fetch = _getWindow.fetch;

    var options_ = typeof options === "string" ? {
      url: options
    } : options;

    var req = _objectSpread({
      read: "auto"
    }, options_, extra, {
      headers: buildHeaders(els, options_, extra),
      body: buildBody(els, options_, extra)
    });

    emit(els, "request", req);
    var res, body;
    return fetch(req.url, req).then(function (r) {
      res = r;
      emit(els, "response", {
        req: req,
        res: res
      });
      if (!req.read) return;
      return readResponse(els, res, req.read).then(function (b) {
        body = b;
        emit(els, "fullResponse", {
          req: req,
          res: res,
          body: body
        });
      });
    }).then(function () {
      if (res.status >= 400) {
        throw new Error("Status code error ".concat(res.status));
      }

      return {
        req: req,
        res: res,
        body: body
      };
    }).catch(function (err) {
      err.req = req;
      err.res = res;
      err.body = body;
      emit(els, "requestError", err);
      throw err;
    });
  }
  function buildHeaders(context, options, extra) {
    var _getWindow2 = getWindow(context),
        Headers = _getWindow2.Headers,
        FormData = _getWindow2.FormData;

    var req = _objectSpread({}, options, extra);

    var headers = new Headers();

    if (req.read === "json" || req.read === "application/json") {
      headers.set("Accept", "application/json");
    }

    if (_typeof(req.body) === "object" && !(req.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    Object.keys(options && options.headers || {}).forEach(function (key) {
      headers.set(key, options.headers[key]);
    });
    Object.keys(extra && extra.headers || {}).forEach(function (key) {
      headers.set(key, extra.headers[key]);
    });
    return headers;
  }
  function buildBody(context, options, extra) {
    var _getWindow3 = getWindow(context),
        FormData = _getWindow3.FormData;

    var body = extra && extra.body || options && options.body;

    if (_typeof(body) === "object" && !(body instanceof FormData)) {
      return JSON.stringify(options.body);
    }

    return body;
  }
  function readResponse(context, res, contentType) {
    var c = contentType === "auto" ? (res.headers.get("content-type") || "").toLowerCase() : contentType;

    switch (c.replace(/;.*$/, "")) {
      case "blob":
        return res.blob();

      case "formData":
      case "application/x-www-form-urlencoded":
        return res.formData();

      case "json":
      case "application/json":
        return res.json();

      case "text":
      case "application/javascript":
      case "text/css":
      case "text/csv":
      case "text/calendar":
      case "text/html":
      case "text/javascript":
      case "text/plain":
        return res.text();

      default:
        return res.arrayBuffer();
    }
  }

  function startChildren(els, offset) {
    forEach(els, function (el) {
      el.__appendOffset = offset || 0;
    });
  }
  function keepChildren(els, n) {
    forEach(els, function (el) {
      el.__appendOffset = typeof el.__appendOffset === "number" ? el.__appendOffset + n : n;
    });
  }
  function appendChildren(els, optionsArray, extra) {
    return optionsArray.map(function (options) {
      return appendChild(els, options, extra);
    });
  }
  function appendChild(els, options, extra) {
    var el = firstOf(els);
    if (!el) return;

    var o = _objectSpread({}, typeof options === "string" ? {
      html: options
    } : options, typeof extra === "string" ? {
      html: extra
    } : extra);

    var compat = o.compatible || compatible;

    var _getWindow = getWindow(el),
        CustomEvent = _getWindow.CustomEvent;

    var proto = getProto(el, o.html); // reconciliation

    var offsetChild = el.children[el.__appendOffset || 0];
    var child = offsetChild;

    if (!offsetChild || !compat(offsetChild, proto)) {
      child = cloneProto(proto);
      el.insertBefore(child, offsetChild);
    } // init child once


    if (o.init && !child.__init) {
      child.__init = true;
      o.init(child);
    } // pass data, if any


    if (o.pass) {
      child.dispatchEvent(new CustomEvent("pass", {
        detail: o.pass,
        bubbles: false
      }));
    }

    el.__appendOffset = typeof el.__appendOffset === "number" ? el.__appendOffset + 1 : 1;
    return child;
  }
  function endChildren(els) {
    var Event;
    forEach(els, function (el) {
      if (!Event) Event = getWindow(el).Event;

      while (el.children.length > el.__appendOffset) {
        el.lastElementChild.dispatchEvent(new Event("destroy", {
          bubbles: false
        }));
        el.removeChild(el.lastElementChild);
      }

      el.__appendOffset = 0;
    });
  }
  function setText(els, text) {
    forEach(els, function (el) {
      if (el.__text !== text) {
        el.__text = text; // safe guard if setText() and setHtml() are used on the same element

        el.__html = {};
        el.innerText = text;
      }
    });
  }
  function setHtml(els, html) {
    forEach(els, function (el) {
      if (el.__html !== html) {
        el.__html = html; // see above

        el.__text = {};
        el.innerHTML = html;
      }
    });
  }
  function setAttr(els, name, value) {
    forEach(els, function (el) {
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
    var list = classNames.split(/\s+/g);
    forEach(els, function (el) {
      var changed = false;
      var result = el.className.split(/\s+/g).filter(function (className) {
        return !!className;
      });
      list.forEach(function (className) {
        var index = result.indexOf(className);

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
  } //

  function compatible(el, proto) {
    return el.__proto === proto || el.tagName === proto.tagName && el.className === proto.className;
  }

  function cloneProto(proto) {
    var el = proto.cloneNode(true);
    el.__proto = proto;
    return el;
  }

  var protoCache = new Map();

  function getProto(context, html) {
    var proto = protoCache.get(html);

    if (!proto) {
      proto = parseEl(context, html);
      protoCache.set(html, proto);
    }

    return proto;
  }

  function sessionValue(els, key, def) {
    return storageValue(els, "sessionStorage", key, def);
  }
  function localValue(els, key, def) {
    return storageValue(els, "localStorage", key, def);
  }
  function storageValue(els, storageName, key, def) {
    if (_typeof(key) === "object") {
      return Object.keys(key).forEach(function (k) {
        storage(els, storageName, k, key[k]);
      });
    }

    var storage = getWindow(els)[storageName];
    listen(els, key, function (e) {
      if (e.__storageValue) return;
      e.__storageValue = true;
      var raw = JSON.stringify(e.detail);

      if (raw !== storage[key]) {
        storage[key] = raw;
      }
    });
    listen(els, "readStorage", function () {
      var raw = storage[key];

      if (typeof raw === "string") {
        try {
          return emit(els, key, JSON.parse(raw));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(err);
        }
      }

      emit(els, key, def);
    });
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
  exports.request = request;
  exports.buildHeaders = buildHeaders;
  exports.buildBody = buildBody;
  exports.readResponse = readResponse;
  exports.startChildren = startChildren;
  exports.keepChildren = keepChildren;
  exports.appendChildren = appendChildren;
  exports.appendChild = appendChild;
  exports.endChildren = endChildren;
  exports.setText = setText;
  exports.setHtml = setHtml;
  exports.setAttr = setAttr;
  exports.setClass = setClass;
  exports.sessionValue = sessionValue;
  exports.localValue = localValue;
  exports.storageValue = storageValue;
  exports.getRefs = getRefs;
  exports.getClosestOfClass = getClosestOfClass;
  exports.contain = contain;
  exports.escapeHtml = escapeHtml;
  exports.parseEl = parseEl;
  exports.getWindow = getWindow;
  exports.hasClass = hasClass;
  exports.BREAK = BREAK;
  exports.forEach = forEach;
  exports.map = map;
  exports.filter = filter;
  exports.indexOf = indexOf;
  exports.listOf = listOf;
  exports.firstOf = firstOf;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=exdom.js.map
