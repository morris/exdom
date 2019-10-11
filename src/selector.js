export function find(el, selector) {
  if (el.document) {
    return el.document.querySelectorAll(selector);
  }

  if (el.documentElement) {
    return el.querySelectorAll(selector);
  }

  return el.querySelectorAll(`#${requireId(el)} ${selector}`);
}

export function matches(el, selector, scope) {
  if (!el.matches) return false;
  if (!scope) {
    return el.matches(selector);
  }

  return el.matches(`#${requireId(scope)} ${selector}`);
}

export function getClosest(el, selector, scope) {
  if (matches(el, selector, scope)) {
    return el;
  } else if (el === scope || !el.parentNode) {
    return;
  } else {
    return getClosest(el.parentNode, selector, scope);
  }
}

export function hasClass(el, className) {
  return el.className
    ? el.className.split(/\s+/g).indexOf(className) >= 0
    : false;
}

export function requireId(el) {
  if (!el.id) {
    const r = Math.random()
      .toString()
      .slice(2);
    el.id = `scope${r}`;
  }

  return el.id;
}
