import { getWindow, forEach } from "./util";
import { emit, send } from "./events";
import { find } from "./selector";

export function mount(el, selector, fn) {
  const window = getWindow(el);
  const scope =
    el === window.document || el === window ? window.document.body : el;

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

export function autoMount(window) {
  window.__mountFrameId = window.requestAnimationFrame(() => {
    autoMount(window);
    doMountAll(window);
  });
}

export function doMountAll(window) {
  const scopes = window.__mountScopes;

  if (!scopes) return;

  scopes.forEach(scope => {
    if (!window.document.body.contains(scope)) {
      return scopes.delete(scope);
    }

    if (
      "__mountLastHtml" in scope &&
      scope.innerHTML === scope.__mountLastHtml
    ) {
      return;
    }

    scope.__mountLastHtml = scope.innerHTML;

    scope.__mount.forEach(m => {
      doMount(scope, m[0], m[1]);
    });
  });
}

export function doMount(el, selector, fn) {
  forEach(find(el, selector), target => {
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
