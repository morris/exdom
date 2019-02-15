export function getRefs(els, classNames, prefix) {
  const refs = {};

  forEach(els, el => {
    classNames.forEach(className => {
      refs[className] = [];
      forEach(el.getElementsByClassName((prefix || "-") + className), el_ => {
        refs[className].push(el_);
      });
    });
  });

  return refs;
}

export function getClosestOfClass(els, className) {
  const el = firstOf(els);

  if (!el) return;

  let current = el;
  while (current) {
    if (hasClass(current, className)) return current;
    current = current.parentNode;
  }
}

export function contain(els, target) {
  const els_ = listOf(els);

  for (let i = 0, l = els_.length; i < l; ++i) {
    let current = target;
    while (current) {
      if (current === els_[i]) return true;
      current = current.parentNode;
    }
  }

  return false;
}

export function escapeHtml(context, text) {
  const tempEl = getTempEl(context);
  tempEl.innerText = text;
  return tempEl.innerHTML;
}

export function parseEl(context, html) {
  if (typeof html === "string") {
    const tempEl = getTempEl(context);
    tempEl.innerHTML = html;
    return tempEl.firstElementChild;
  }

  return html;
}

export function getWindow(els) {
  const document = els.ownerDocument || els[0].ownerDocument;
  return document.defaultView || document.parentWindow;
}

export function hasClass(els, className) {
  const tmp = map(els, el => (el.className ? el.className.split(/\s+/g) : []));
  return (
    tmp.filter(classNames => classNames.indexOf(className) >= 0).length ===
    tmp.length
  );
}

export const BREAK = {};

export function forEach(els, fn) {
  const els_ = listOf(els);

  for (let i = 0, l = els_.length; i < l; ++i) {
    if (fn(els_[i], i) === BREAK) return els_;
  }

  return els_;
}

export function map(els, fn) {
  const els_ = listOf(els);
  const result = [];

  for (let i = 0, l = els_.length; i < l; ++i) {
    result.push(fn(els_[i], i));
  }

  return result;
}

export function filter(els, fn) {
  const els_ = listOf(els);
  const result = [];

  for (let i = 0, l = els_.length; i < l; ++i) {
    const el = els_[i];
    if (fn(el, i)) result.push(el);
  }

  return result;
}

export function indexOf(els, el) {
  const els_ = listOf(els);

  for (let i = 0, l = els_.length; i < l; ++i) {
    if (els_[i] === el) return i;
  }

  return -1;
}

export function listOf(els) {
  if (!els) return [];
  if (els.addEventListener) return [els];
  return els;
}

export function firstOf(els) {
  if (!els) return;
  if (els.addEventListener) return els;
  return els[0];
}

//

let _tempEl;

function getTempEl(context) {
  if (!_tempEl) {
    const document = context.ownerDocument || context[0].ownerDocument;
    _tempEl = document.createElement("div");
  }

  return _tempEl;
}
