import { forEach, parseEl, getWindow } from "./util";

export function setChildren(els, optionsArray, extra) {
  forEach(els, el => {
    optionsArray.forEach((options, index) => {
      setChild(el, options, {
        ...extra,
        index: ((extra && extra.index) || 0) + index
      });
    });
  });
}

export function setChild(els, options, extra) {
  const o = {
    ...(typeof options === "string" ? { html: options } : options),
    ...extra
  };

  const index = o.index || 0;
  const tail = o.tail || 0;
  const compat = o.compatible || compatible;

  forEach(els, el => {
    const { Event, CustomEvent } = getWindow(el);
    const proto = o.proto || (o.html && getProto(el, o.html));
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
