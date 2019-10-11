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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function contains(el, target) {
    var current = target;

    while (current) {
      if (current === el) return true;
      current = current.parentNode;
    }

    return false;
  }
  function escapeHtml(target, text) {
    var tempEl = getTempEl(target);
    tempEl.innerText = text;
    return tempEl.innerHTML;
  }
  function parseEl(target, html) {
    if (typeof html === "string") {
      var tempEl = getTempEl(target);
      tempEl.innerHTML = html;
      return tempEl.firstElementChild;
    }

    return html;
  }
  function getWindow(el) {
    var document = getDocument(el);
    return document.defaultView || document.parentWindow;
  }
  function getDocument(el) {
    return el.ownerDocument || el.document || el.documentElement && el;
  }
  var BREAK = {};
  function forEach(els, fn) {
    for (var i = 0, l = els.length; i < l; ++i) {
      if (fn(els[i], i) === BREAK) return els;
    }

    return els;
  }
  function map(els, fn) {
    var result = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      result.push(fn(els[i]));
    }

    return result;
  }
  function filter(els, fn) {
    var result = [];

    for (var i = 0, l = els.length; i < l; ++i) {
      var el = els[i];
      if (fn(el, i)) result.push(el);
    }

    return result;
  } //

  var tempElMap = new Map();

  function getTempEl(target) {
    var tempEl = tempElMap.get(target.tagName);

    if (!tempEl) {
      var document = target.ownerDocument || target[0].ownerDocument;
      tempEl = document.createElement(target.tagName);
      tempElMap.set(target.tagName, tempEl);
    }

    return tempEl;
  }

  function find(el, selector) {
    if (el.document) {
      return el.document.querySelectorAll(selector);
    }

    if (el.documentElement) {
      return el.querySelectorAll(selector);
    }

    return el.querySelectorAll("#".concat(requireId(el), " ").concat(selector));
  }
  function matches(el, selector, scope) {
    if (!el.matches) return false;

    if (!scope) {
      return el.matches(selector);
    }

    return el.matches("#".concat(requireId(scope), " ").concat(selector));
  }
  function getClosest(el, selector, scope) {
    if (matches(el, selector, scope)) {
      return el;
    } else if (el === scope || !el.parentNode) {
      return;
    } else {
      return getClosest(el.parentNode, selector, scope);
    }
  }
  function hasClass(el, className) {
    return el.className ? el.className.split(/\s+/g).indexOf(className) >= 0 : false;
  }
  function requireId(el) {
    if (!el.id) {
      var r = Math.random().toString().slice(2);
      el.id = "scope".concat(r);
    }

    return el.id;
  }

  function observe(el, eventSelectors, handler) {
    var es = Array.isArray(eventSelectors) ? eventSelectors : [eventSelectors];
    var types = [];
    var cache = {};
    var triggerRequired = false;
    es.forEach(function (o) {
      parseEventSelector(o).forEach(function (it) {
        if (it.trigger) triggerRequired = true;
        types.push(it);
      });
    });
    types.forEach(function (type) {
      var name = type.name,
          trigger = type.trigger,
          selector = type.selector;
      listen(el, name, function (e) {
        if (selector && !matches(e.target, selector, el)) return;

        if (!trigger) {
          cache[name] = e.detail;
          if (triggerRequired) return;
        }

        var details = _objectSpread2({}, cache);

        if (trigger) details[name] = e.detail;
        handler(details, e);
      });
    });
  }
  function listen(el, type, handler, options) {
    var h = function h(e) {
      try {
        return handler(e);
      } catch (err) {
        emit(el, "error", err);
      }
    };

    el.addEventListener(type, h, options || false);
    return h;
  }
  function emit(el, type, detail) {
    dispatch(el, type, detail, true);
  }
  function send(el, type, detail) {
    dispatch(el, type, detail, false);
  }
  function dispatch(el, type, detail, bubbles) {
    if (_typeof(type) === "object") {
      Object.keys(type).forEach(function (t) {
        dispatch(el, t, type[t], bubbles);
      });
      return;
    }

    var _getWindow = getWindow(el),
        CustomEvent = _getWindow.CustomEvent;

    try {
      el.dispatchEvent(new CustomEvent(type, {
        detail: detail,
        bubbles: bubbles
      }));
    } catch (err) {
      try {
        el.dispatchEvent(new CustomEvent("error", {
          err: err,
          bubbles: true
        }));
      } catch (err_) {
        // last resort
        console.error(err); // eslint-disable-line no-console

        console.error(err_); // eslint-disable-line no-console
      }
    }
  } //

  function parseEventSelector(eventSelector) {
    var s = eventSelector.split(/@/);
    return s[0].split(/[\s,]+/).filter(function (type) {
      return type.length > 0;
    }).map(function (type) {
      var trigger = type[0] === "$";
      return {
        name: trigger ? type.slice(1) : type,
        trigger: trigger,
        selector: s[1]
      };
    });
  }

  function setChildren(el, template, number) {
    // create/reconcile elements
    var offset = 0;

    if (Array.isArray(template)) {
      template.forEach(function (t) {
        var offsetChild = el.children[offset];

        if (!offsetChild || offsetChild.__template !== t) {
          el.insertBefore(cloneTemplate(getTemplate(el, t)), offsetChild);
        }

        ++offset;
      });
    } else {
      var proto = getTemplate(el, template);

      while (offset < number) {
        var offsetChild = el.children[offset];

        if (!offsetChild || offsetChild.__template !== template) {
          el.insertBefore(cloneTemplate(proto), offsetChild);
        }

        ++offset;
      }
    } // remove obsolete children


    while (el.children.length > offset) {
      el.removeChild(el.lastElementChild);
    }
  }
  var UNSET = {};
  function setText(el, text) {
    if (el.__text !== text) {
      el.__text = text; // safe guard if setText() and setHtml() are used on the same element

      el.__html = UNSET;
      el.innerText = text;
    }
  }
  function setHtml(el, html) {
    if (el.__html !== html) {
      el.__html = html; // see above

      el.__text = UNSET;
      el.innerHTML = html;
    }
  }
  function setAttr(el, name, value) {
    if (!el.__attr) el.__attr = {};

    if (!Object.prototype.hasOwnProperty.call(el.__attr, name) || el.__attr[name] !== value) {
      el.__attr[name] = value;

      if (typeof value === "undefined" || value === null) {
        el.removeAttribute(name, value);
      } else {
        el.setAttribute(name, value);
      }
    }
  }
  function setClass(el, classNames, condition) {
    var list = classNames.split(/\s+/g);
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
  } //

  function cloneTemplate(proto) {
    var el = proto.cloneNode(true);
    el.__template = proto.__template;
    return el;
  }

  var templateCache = new Map();

  function getTemplate(target, template) {
    var key = target.tagName + template;
    var proto = templateCache.get(key);

    if (!proto) {
      proto = parseTemplate(target, template);
      proto.__template = template;
      templateCache.set(key, proto);
    }

    return proto;
  }

  function parseTemplate(target, template) {
    if (template.match(/^\s*</)) return parseEl(target, template);
    var classNames = template.split(".");
    var tagName = classNames.shift() || "div";
    var el = getDocument(target).createElement(tagName);
    el.className = classNames.join(" ");
    return el;
  }

  function getValue(el) {
    switch (el.tagName === "INPUT" ? el.type : el.tagName) {
      case "checkbox":
      case "radio":
        return !!el.checked;

      default:
        // text, hidden, password, textarea, etc.
        return el.value || "";
    }
  }
  function setValue(el, value) {
    var tagName = el.tagName;
    var val = toValue(value);
    var elValue, multiple, checked;

    switch (tagName === "INPUT" ? el.type : tagName) {
      case "checkbox":
      case "radio":
        elValue = el.getAttribute("value") || "on";
        checked = Array.isArray(val) ? value.indexOf(elValue) >= 0 : val === elValue;
        if (el.checked !== checked) el.checked = checked;
        break;

      case "SELECT":
        multiple = el.multiple && Array.isArray(val);
        forEach(el.options, function (option) {
          var optionValue = option.value || option.textContent;
          var selected = multiple ? value.indexOf(optionValue) >= 0 : value + "" == optionValue;
          if (option.selected !== selected) option.selected = selected;
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
  }
  function toValue(value) {
    if (value === null || value === undefined || value === false) return "";
    if (value === true) return "on";
    if (Array.isArray(value)) return value.map(toValue);
    return value + "";
  }

  function request(el, options, extra) {
    var _getWindow = getWindow(el),
        fetch = _getWindow.fetch;

    var options_ = typeof options === "string" ? {
      url: options
    } : options;

    var req = _objectSpread2({
      read: "auto"
    }, options_, {}, extra, {
      headers: buildHeaders(el, options_, extra),
      body: buildBody(el, options_, extra)
    });

    emit(el, "request", req);
    var res, body;
    return fetch(req.url, req).then(function (r) {
      res = r;
      emit(el, "response", {
        req: req,
        res: res
      });
      if (!req.read) return;
      return readResponse(el, res, req.read).then(function (b) {
        body = b;
        emit(el, "fullResponse", {
          req: req,
          res: res,
          body: body
        });
      });
    }).then(function () {
      if (!res.ok) {
        throw new Error("Status code error ".concat(res.status));
      }

      emit(el, "requestDone");
      return {
        req: req,
        res: res,
        body: body
      };
    }).catch(function (err) {
      err.req = req;
      err.res = res;
      err.body = body;
      emit(el, "requestError", err);
      emit(el, "requestDone");
      throw err;
    });
  }
  function buildHeaders(context, options, extra) {
    var _getWindow2 = getWindow(context),
        Headers = _getWindow2.Headers,
        FormData = _getWindow2.FormData;

    var req = _objectSpread2({}, options, {}, extra);

    var headers = new Headers();

    if (req.read === "json" || req.read === "application/json") {
      headers.set("Accept", "application/json");
    }

    if (_typeof(req.body) === "object" && !(req.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (options && options.headers) {
      Object.keys(options.headers).forEach(function (key) {
        headers.set(key, options.headers[key]);
      });
    }

    if (extra && extra.headers) {
      Object.keys(extra.headers).forEach(function (key) {
        headers.set(key, extra.headers[key]);
      });
    }

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

  function mount(el, selector, fn) {
    var window = getWindow(el);
    var scope = el === window.document || el === window ? window.document.body : el;

    if (scope.__mount) {
      scope.__mount.push([selector, fn]);
    } else {
      scope.__mount = [[selector, fn]];
    }

    doMount(scope, selector, fn);

    if (!window.__mountScopes) {
      window.__mountScopes = new Set([scope]);
      autoMount(window);
    } else {
      window.__mountScopes.add(scope);
    }
  }
  function autoMount(window) {
    window.__mountFrameId = window.requestAnimationFrame(function () {
      autoMount(window);
      doMountAll(window);
    });
  }
  function doMountAll(window) {
    var scopes = window.__mountScopes;
    if (!scopes) return;
    scopes.forEach(function (scope) {
      if (!window.document.body.contains(scope)) {
        return scopes.delete(scope);
      }

      if ("__mountLastHtml" in scope && scope.innerHTML === scope.__mountLastHtml) {
        return;
      }

      scope.__mountLastHtml = scope.innerHTML;

      scope.__mount.forEach(function (m) {
        doMount(scope, m[0], m[1]);
      });
    });
  }
  function doMount(el, selector, fn) {
    forEach(find(el, selector), function (target) {
      if (!target.__mounted) {
        target.__mounted = new Set([fn]);
      } else if (target.__mounted.has(fn)) {
        return;
      } else {
        target.__mounted.add(fn);
      }

      try {
        fn(target);
        if ("__pass" in target) send(target, "pass", target.__pass);
      } catch (err) {
        emit(target, "error", err);
      }
    });
  }

  function sessionValue(el, key, def) {
    return storageValue(el, "sessionStorage", key, def);
  }
  function localValue(el, key, def) {
    return storageValue(el, "localStorage", key, def);
  }
  function storageValue(el, storageName, key, def) {
    if (_typeof(key) === "object") {
      return Object.keys(key).forEach(function (k) {
        storageValue(el, storageName, k, key[k]);
      });
    }

    var window = getWindow(el);
    var storage = window[storageName];
    listen(el, key, function (e) {
      if (e.__storageValue) return;
      e.__storageValue = true;
      var raw = JSON.stringify(e.detail);

      if (raw !== storage[key]) {
        storage[key] = raw;
      }
    });
    var raw = storage[key];

    if (typeof raw === "string") {
      try {
        return emit(el, key, JSON.parse(raw));
      } catch (err) {
        console.warn(err); // eslint-disable-line no-console
      }
    }

    emit(el, key, def);
  }

  function exdom(els) {
    if (!els) return new Exdom([]);
    if (els.addEventListener) return new Exdom([els]);
    return new Exdom(els);
  }
  var Exdom =
  /*#__PURE__*/
  function () {
    function Exdom(els) {
      _classCallCheck(this, Exdom);

      this.els = els;
    } // mounting


    _createClass(Exdom, [{
      key: "for",
      value: function _for(selector, body) {
        var _this = this;

        forEach(this.els, function (el) {
          return mount(el, selector, function (el) {
            return body(new _this.constructor([el]));
          });
        });
      } // selector

    }, {
      key: "find",
      value: function find$1(selector) {
        var results = [];

        forEach(this.els, function (el) {
          results.push.apply(results, find(el, selector));
        });

        return new this.constructor(results);
      }
    }, {
      key: "matches",
      value: function matches$1(selector) {
        var result = false;

        forEach(this.els, function (el) {
          if (matches(el, selector)) {
            result = true;
          } else {
            result = false;
            return BREAK;
          }
        });

        return result;
      }
    }, {
      key: "hasClass",
      value: function hasClass$1(className) {
        var result = false;

        forEach(this.els, function (el) {
          if (hasClass(el, className)) {
            result = true;
          } else {
            result = false;
            return BREAK;
          }
        });

        return result;
      }
    }, {
      key: "closest",
      value: function closest(selector) {
        var results = [];

        forEach(this.els, function (el) {
          var closest = getClosest(el, selector);
          if (closest) results.push(closest);
        });

        return new this.constructor(results);
      } // util

    }, {
      key: "forEach",
      value: function forEach$1(fn) {
        var _this2 = this;

        forEach(this.els, function (el) {
          return fn(new _this2.constructor(el));
        });

        return this;
      }
    }, {
      key: "filter",
      value: function filter$1(fn) {
        var _this3 = this;

        if (typeof fn === "string") {
          return new this.constructor(filter(this.els, function (el) {
            return matches(el, fn);
          }));
        }

        return new this.constructor(filter(this.els, function (el) {
          return fn(new _this3.constructor(el));
        }));
      } // render

    }, {
      key: "children",
      value: function children(data, templateSelector) {
        forEach(this.els, function (el) {
          var pass = data;

          if (templateSelector) {
            setChildren(el, templateSelector, data.length);
          } else {
            setChildren(el, data.map(function (it) {
              return it.template;
            }));
            pass = data.map(function (it) {
              return it.pass;
            });
          }

          for (var i = 0, l = el.children.length; i < l; ++i) {
            var child = el.children[i];
            child.__pass = pass[i];

            send(child, "pass", pass[i]);
          }
        });

        return this;
      }
    }, {
      key: "attr",
      value: function attr(key, value) {
        forEach(this.els, function (el) {
          return setAttr(el, key, value);
        });

        return this;
      }
    }, {
      key: "classes",
      value: function classes(classNames, condition) {
        forEach(this.els, function (el) {
          return setClass(el, classNames, condition);
        });

        return this;
      }
    }, {
      key: "html",
      value: function html(_html) {
        forEach(this.els, function (el) {
          return setHtml(el, _html);
        });

        return this;
      }
    }, {
      key: "text",
      value: function text(_text) {
        forEach(this.els, function (el) {
          return setText(el, _text);
        });

        return this;
      } // forms

    }, {
      key: "value",
      value: function value(_value) {
        if (arguments.length === 0) {
          if (this.els.length === 0) return undefined;
          return getValue(this.els[0]);
        }

        forEach(this.els, function (el) {
          return setValue(el, _value);
        });

        return this;
      } // events

    }, {
      key: "on",
      value: function on(eventSelectors, handler) {
        var _this4 = this;

        forEach(this.els, function (el) {
          return observe(el, eventSelectors, function (d, e) {
            handler(_this4, d, e);
          });
        });

        return this;
      }
    }, {
      key: "emit",
      value: function emit$1(type, detail) {
        forEach(this.els, function (el) {
          return emit(el, type, detail);
        });

        return this;
      }
    }, {
      key: "send",
      value: function send$1(type, detail) {
        forEach(this.els, function (el) {
          return send(el, type, detail);
        });

        return this;
      } // http

    }, {
      key: "request",
      value: function request$1(options, extra) {
        if (this.els.length !== 1) {
          console.warn("Called request() on an element scope with ".concat(this.els.length, " elements"));
          return this;
        }

        return request(this.els[0], options, extra);
      } // deferred

    }, {
      key: "timeout",
      value: function timeout(ms, fn) {
        var _this5 = this;

        return setTimeout(function () {
          return fn(_this5);
        }, ms);
      }
    }, {
      key: "interval",
      value: function interval(ms, fn) {
        var _this6 = this;

        return setInterval(function () {
          return fn(_this6);
        }, ms);
      } // storage

    }, {
      key: "local",
      value: function local(key, def) {
        forEach(this.els, function (el) {
          return localValue(el, key, def);
        });

        return this;
      }
    }, {
      key: "session",
      value: function session(key, def) {
        forEach(this.els, function (el) {
          return sessionValue(el, key, def);
        });

        return this;
      }
    }]);

    return Exdom;
  }();

  exports.BREAK = BREAK;
  exports.Exdom = Exdom;
  exports.autoMount = autoMount;
  exports.buildBody = buildBody;
  exports.buildHeaders = buildHeaders;
  exports.contains = contains;
  exports.dispatch = dispatch;
  exports.doMount = doMount;
  exports.doMountAll = doMountAll;
  exports.emit = emit;
  exports.escapeHtml = escapeHtml;
  exports.exdom = exdom;
  exports.filter = filter;
  exports.find = find;
  exports.forEach = forEach;
  exports.getClosest = getClosest;
  exports.getDocument = getDocument;
  exports.getValue = getValue;
  exports.getWindow = getWindow;
  exports.hasClass = hasClass;
  exports.listen = listen;
  exports.localValue = localValue;
  exports.map = map;
  exports.matches = matches;
  exports.mount = mount;
  exports.observe = observe;
  exports.parseEl = parseEl;
  exports.readResponse = readResponse;
  exports.request = request;
  exports.requireId = requireId;
  exports.send = send;
  exports.sessionValue = sessionValue;
  exports.setAttr = setAttr;
  exports.setChildren = setChildren;
  exports.setClass = setClass;
  exports.setHtml = setHtml;
  exports.setText = setText;
  exports.setValue = setValue;
  exports.storageValue = storageValue;
  exports.toValue = toValue;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=exdom.js.map
