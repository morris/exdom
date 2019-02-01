import { forEach, getWindow } from "./util";

export function observe(els, options, extra) {
  const o = {
    ...(typeof options === "function" ? { action: options } : options),
    ...(typeof extra === "function" ? { action: extra } : extra)
  };

  let hasVolatile = false;

  const types = (o.types || parseArgumentNames(o.action)).map(name => {
    const full = name[0] === "_";
    const volatile = full || name[0] === "$";

    if (volatile) hasVolatile = true;

    return {
      name: volatile ? name.slice(1) : name,
      volatile,
      full
    };
  });

  forEach(els, el => {
    const cache = [];
    cache.length = types.length;

    let deferTimeout;

    types.forEach((type, index) => {
      listen(el, type.name, e => {
        if (!type.volatile) cache[index] = e.detail;

        if (!hasVolatile || type.volatile) {
          if (o.defer) {
            clearTimeout(deferTimeout);
            deferTimeout = setTimeout(applyAction, o.defer);
          } else {
            applyAction();
          }
        }

        function applyAction() {
          if (type.volatile) {
            const args = cache.slice(0);
            args[index] = type.full ? e : e.detail;
            o.action.apply(null, args);
          } else {
            o.action.apply(null, cache);
          }
        }
      });
    });
  });
}

export function relay(els, type, targets) {
  listen(els, type, e => {
    send(targets, type, e.detail);
  });
}

export function listen(els, type, listener, options) {
  forEach(els, el => {
    el.addEventListener(
      type,
      e => {
        try {
          return listener(e);
        } catch (ex) {
          emit(el, "error", ex);
        }
      },
      options || false
    );
  });
}

export function send(els, type, detail) {
  if (!els || (!els.ownerDocument && els.length === 0)) return;

  const { CustomEvent } = getWindow(els);

  dispatch(
    els,
    new CustomEvent(type, {
      detail: arguments.length === 2 ? {} : detail,
      bubbles: false
    })
  );
}

export function emit(els, type, detail) {
  if (!els || (!els.ownerDocument && els.length === 0)) return;

  const { CustomEvent } = getWindow(els);

  dispatch(
    els,
    new CustomEvent(type, {
      detail: arguments.length === 2 ? {} : detail,
      bubbles: true
    })
  );
}

export function dispatch(els, e) {
  forEach(els, el => {
    el.dispatchEvent(e);
  });
}

//

function parseArgumentNames(fn) {
  const m = fn
    .toString()
    .match(/^function[^(]*\(([^)]*)\)|^\(([^)]*)\)|^([a-zA-Z$_][^=]*)/);
  const args = m[1] || m[2] || m[3];

  return args
    .split(",")
    .map(arg => arg.trim())
    .filter(arg => !!arg);
}
