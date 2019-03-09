export function getRefs(els, prefix, inputRefs) {
  const refs = inputRefs || {};

  forEach(els, el => {
    if (el.className) {
      el.className.split(/\s+/g).map(className => {
        let refName;

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

export function getClosestOfClass(els, className) {
  const el = firstOf(els);

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

function camelCase(str) {
  return str.replace(/-+./g, m => m.slice(m.length - 1).toUpperCase());
}
