export function getRefs(els, classNames, prefix) {
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

export function escapeHtml(text, context) {
  const tempEl = getTempEl(context);
  tempEl.innerText = text;
  return tempEl.innerHTML;
}

export function parseEl(html, context) {
  if (typeof html === "string") {
    const tempEl = getTempEl(context);
    tempEl.innerHTML = html;
    return tempEl.firstElementChild;
  }

  return html;
}

export function getWindow(els) {
  const doc = els.ownerDocument || els[0].ownerDocument;
  return doc.defaultView || doc.parentWindow;
}

export function hasClass(els, className) {
  const tmp = map(els, el => (el.className ? el.className.split(/\s+/g) : []));
  return (
    tmp.filter(classNames => classNames.indexOf(className) >= 0).length ===
    tmp.length
  );
}

export const BREAK = {};

export function forEach(list, fn) {
  if (list && list.addEventListener) list = [list];
  if (!list) list = [];
  for (let i = 0, l = list.length; i < l; ++i) {
    if (fn(list[i], i) === BREAK) return list;
  }
  return list;
}

export function map(list, fn) {
  if (list && list.addEventListener) list = [list];
  if (!list) list = [];
  const result = [];
  for (let i = 0, l = list.length; i < l; ++i) {
    result.push(fn(list[i], i));
  }
  return result;
}

export function filter(list, fn) {
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
