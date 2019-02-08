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

  function getRefs(els, classNames, prefix) {
    var refs = {};
    forEach(els, function (el) {
      classNames.forEach(function (className) {
        refs[className] = [];
        forEach(el.getElementsByClassName((prefix || "-") + className), function (el_) {
          refs[className].push(el_);
        });
      });
    });
    return refs;
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
    if (els && els.addEventListener) els = [els];
    if (!els) els = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      if (fn(els[i], i) === BREAK) return els;
    }

    return els;
  }
  function map(els, fn) {
    if (els && els.addEventListener) els = [els];
    if (!els) els = [];
    var result = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      result.push(fn(els[i], i));
    }

    return result;
  }
  function filter(els, fn) {
    if (els && els.addEventListener) els = [els];
    if (!els) els = [];
    var result = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      if (fn(els[i], i)) result.push(els[i]);
    }

    return result;
  }
  function indexOf(els, el) {
    if (els && els.addEventListener) els = [els];
    if (!els) els = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      if (els[i] === el) return i;
    }

    return -1;
  } //

  var _tempEl;

  function getTempEl(context) {
    var document = context.ownerDocument || context[0].ownerDocument;
    if (!_tempEl) _tempEl = document.createElement("div");
    return _tempEl;
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
            if (typeof o.target === "string" && !hasClass(e.target, o.target) || o.target && indexOf(o.target, e.target) === -1) {
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
    var el = els && els.addEventListener ? els : els[0];
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
    forEach(els, function (el) {
      var tagName = el.tagName;
      var val = toValue(value);
      var elValue, multiple;

      switch (tagName === "INPUT" ? el.type : tagName) {
        case "text":
        case "password":
        case "TEXTAREA":
          if (el.value !== val + "") el.value = val;
          break;

        case "checkbox":
          elValue = el.getAttribute("value") || "on";
          el.checked = Array.isArray(val) ? value.indexOf(elValue) >= 0 : val === elValue;
          break;

        case "radio":
          // TODO
          break;

        case "SELECT":
          multiple = el.multiple && Array.isArray(val);
          forEach(el.options, function (option) {
            var optionValue = option.value || option.textContent;
            option.selected = multiple ? value.indexOf(optionValue) >= 0 : value + "" == optionValue;
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

  function setChildren(els, optionsArray, extra) {
    forEach(els, function (el) {
      var offset = extra && extra.index || 0;
      var tail = extra && extra.tail || 0;
      optionsArray.forEach(function (options, index) {
        setChild(el, options, _objectSpread({}, extra, {
          index: offset + index,
          tail: tail
        }));
      }); // remove obsolete children

      while (el.children.length - optionsArray.length - offset > tail) {
        el.removeChild(el.lastElementChild);
      }
    });
  }
  function setChild(els, options, extra) {
    var o = _objectSpread({}, typeof options === "string" ? {
      html: options
    } : options, extra);

    var index = o.index || 0;
    var tail = o.tail || 0;
    var compat = o.compatible || compatible;
    forEach(els, function (el) {
      var _getWindow = getWindow(el),
          Event = _getWindow.Event,
          CustomEvent = _getWindow.CustomEvent;

      var proto = o.proto || o.html && getProto(el, o.html);
      var maxIndex = el.children.length - tail;

      if (index > maxIndex) {
        throw new Error("Cannot render child element at index ".concat(index, " of ").concat(el.children.length, " children and tail ").concat(tail));
      } // reconciliation


      var childAtIndex = el.children[index];
      var child;

      if (!proto) {
        // if no prototype element was given,
        // there must be an existing child to init/update
        if (!childAtIndex) {
          throw new Error("Cannot render new child element at index ".concat(index, " without base html"));
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
        childAtIndex.dispatchEvent(new Event("destroy", {
          bubbles: false
        }));
        el.replaceChild(child, childAtIndex);
      } else {
        // finally, if child is compatible with prototype, dont insert/replace,
        // just init and update existing child
        child = childAtIndex;
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
      emit(els, "res", {
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
  exports.request = request;
  exports.buildHeaders = buildHeaders;
  exports.buildBody = buildBody;
  exports.readResponse = readResponse;
  exports.getRefs = getRefs;
  exports.escapeHtml = escapeHtml;
  exports.parseEl = parseEl;
  exports.getWindow = getWindow;
  exports.hasClass = hasClass;
  exports.BREAK = BREAK;
  exports.forEach = forEach;
  exports.map = map;
  exports.filter = filter;
  exports.indexOf = indexOf;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=exdom.js.map
