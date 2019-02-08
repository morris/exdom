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
  if (els) {
    if (els.addEventListener) {
      els = [els];
    }
  } else {
    els = [];
  }

  for (let i = 0, l = els.length; i < l; ++i) {
    if (fn(els[i], i) === BREAK) return els;
  }

  return els;
}

export function map(els, fn) {
  if (els) {
    if (els.addEventListener) {
      els = [els];
    }
  } else {
    els = [];
  }

  const result = [];

  for (let i = 0, l = els.length; i < l; ++i) {
    result.push(fn(els[i], i));
  }

  return result;
}

export function filter(els, fn) {
  if (els) {
    if (els.addEventListener) {
      els = [els];
    }
  } else {
    els = [];
  }

  const result = [];

  for (let i = 0, l = els.length; i < l; ++i) {
    if (fn(els[i], i)) result.push(els[i]);
  }

  return result;
}

export function indexOf(els, el) {
  if (els) {
    if (els.addEventListener) {
      els = [els];
    }
  } else {
    els = [];
  }

  for (let i = 0, l = els.length; i < l; ++i) {
    if (els[i] === el) return i;
  }

  return -1;
}

//

let _tempEl;

function getTempEl(context) {
  const document = context.ownerDocument || context[0].ownerDocument;
  if (!_tempEl) _tempEl = document.createElement("div");
  return _tempEl;
}
