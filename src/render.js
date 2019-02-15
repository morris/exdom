import { forEach, firstOf, parseEl, getWindow } from "./util";

export function startChildren(els, offset) {
  forEach(els, el => {
    el.__appendOffset = offset || 0;
  });
}

export function keepChildren(els, n) {
  forEach(els, el => {
    el.__appendOffset =
      typeof el.__appendOffset === "number" ? el.__appendOffset + n : n;
  });
}

export function appendChildren(els, optionsArray, extra) {
  return optionsArray.map(options => appendChild(els, options, extra));
}

export function appendChild(els, options, extra) {
  const el = firstOf(els);

  if (!el) return;

  const o = {
    ...(typeof options === "string" ? { html: options } : options),
    ...(typeof extra === "string" ? { html: extra } : extra)
  };

  const compat = o.compatible || compatible;
  const { CustomEvent } = getWindow(el);
  const proto = getProto(el, o.html);

  // reconciliation
  const offsetChild = el.children[el.__appendOffset || 0];
  let child = offsetChild;

  if (!offsetChild || !compat(offsetChild, proto)) {
    child = cloneProto(proto);
    el.insertBefore(child, offsetChild);
  }

  // init child once
  if (o.init && !child.__init) {
    child.__init = true;
    o.init(child);
  }

  // pass data, if any
  if (o.pass) {
    child.dispatchEvent(
      new CustomEvent("pass", {
        detail: o.pass,
        bubbles: false
      })
    );
  }

  el.__appendOffset =
    typeof el.__appendOffset === "number" ? el.__appendOffset + 1 : 1;

  return child;
}

export function endChildren(els) {
  let Event;

  forEach(els, el => {
    if (!Event) Event = getWindow(el).Event;

    while (el.children.length > el.__appendOffset) {
      el.lastElementChild.dispatchEvent(
        new Event("destroy", {
          bubbles: false
        })
      );
      el.removeChild(el.lastElementChild);
    }
    el.__appendOffset = 0;
  });
}

export function setText(els, text) {
  forEach(els, el => {
    if (el.__text !== text) {
      el.__text = text;
      // safe guard if setText() and setHtml() are used on the same element
      el.__html = {};
      el.innerText = text;
    }
  });
}

export function setHtml(els, html) {
  forEach(els, el => {
    if (el.__html !== html) {
      el.__html = html;
      // see above
      el.__text = {};
      el.innerHTML = html;
    }
  });
}

export function setAttr(els, name, value) {
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

export function setClass(els, classNames, condition) {
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

function getProto(context, html) {
  let proto = protoCache.get(html);
  if (!proto) {
    proto = parseEl(context, html);
    protoCache.set(html, proto);
  }

  return proto;
}
