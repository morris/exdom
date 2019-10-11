export function contains(el, target) {
  let current = target;

  while (current) {
    if (current === el) return true;
    current = current.parentNode;
  }

  return false;
}

export function escapeHtml(target, text) {
  const tempEl = getTempEl(target);
  tempEl.innerText = text;

  return tempEl.innerHTML;
}

export function parseEl(target, html) {
  if (typeof html === "string") {
    const tempEl = getTempEl(target);
    tempEl.innerHTML = html;

    return tempEl.firstElementChild;
  }

  return html;
}

export function getWindow(el) {
  const document = getDocument(el);
  return document.defaultView || document.parentWindow;
}

export function getDocument(el) {
  return el.ownerDocument || el.document || (el.documentElement && el);
}

export const BREAK = {};

export function forEach(els, fn) {
  for (let i = 0, l = els.length; i < l; ++i) {
    if (fn(els[i], i) === BREAK) return els;
  }

  return els;
}

export function map(els, fn) {
  const result = [];

  for (let i = 0, l = els.length; i < l; ++i) {
    result.push(fn(els[i]));
  }

  return result;
}

export function filter(els, fn) {
  const result = [];

  for (let i = 0, l = els.length; i < l; ++i) {
    const el = els[i];
    if (fn(el, i)) result.push(el);
  }

  return result;
}

//

let tempElMap = new Map();

function getTempEl(target) {
  let tempEl = tempElMap.get(target.tagName);

  if (!tempEl) {
    const document = target.ownerDocument || target[0].ownerDocument;
    tempEl = document.createElement(target.tagName);
    tempElMap.set(target.tagName, tempEl);
  }

  return tempEl;
}
