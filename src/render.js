import { parseEl, getDocument } from "./util";

export function setChildren(el, template, number) {
  // create/reconcile elements
  let offset = 0;

  if (Array.isArray(template)) {
    template.forEach(t => {
      const offsetChild = el.children[offset];

      if (!offsetChild || offsetChild.__template !== t) {
        el.insertBefore(cloneTemplate(getTemplate(el, t)), offsetChild);
      }

      ++offset;
    });
  } else {
    const proto = getTemplate(el, template);

    while (offset < number) {
      const offsetChild = el.children[offset];

      if (!offsetChild || offsetChild.__template !== template) {
        el.insertBefore(cloneTemplate(proto), offsetChild);
      }

      ++offset;
    }
  }

  // remove obsolete children
  while (el.children.length > offset) {
    el.removeChild(el.lastElementChild);
  }
}

const UNSET = {};

export function setText(el, text) {
  if (el.__text !== text) {
    el.__text = text;
    // safe guard if setText() and setHtml() are used on the same element
    el.__html = UNSET;
    el.innerText = text;
  }
}

export function setHtml(el, html) {
  if (el.__html !== html) {
    el.__html = html;
    // see above
    el.__text = UNSET;
    el.innerHTML = html;
  }
}

export function setAttr(el, name, value) {
  if (!el.__attr) el.__attr = {};
  if (
    !Object.prototype.hasOwnProperty.call(el.__attr, name) ||
    el.__attr[name] !== value
  ) {
    el.__attr[name] = value;
    if (typeof value === "undefined" || value === null) {
      el.removeAttribute(name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
}

export function setClass(el, classNames, condition) {
  const list = classNames.split(/\s+/g);

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
}

//

function cloneTemplate(proto) {
  const el = proto.cloneNode(true);
  el.__template = proto.__template;

  return el;
}

const templateCache = new Map();

function getTemplate(target, template) {
  const key = target.tagName + template;
  let proto = templateCache.get(key);

  if (!proto) {
    proto = parseTemplate(target, template);
    proto.__template = template;
    templateCache.set(key, proto);
  }

  return proto;
}

function parseTemplate(target, template) {
  if (template.match(/^\s*</)) return parseEl(target, template);

  const classNames = template.split(".");
  const tagName = classNames.shift() || "div";

  const el = getDocument(target).createElement(tagName);
  el.className = classNames.join(" ");

  return el;
}
