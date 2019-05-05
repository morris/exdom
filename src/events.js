import { forEach, getWindow, getClosestOfClass, contain } from "./util";

export function observe(els, options, extra) {
  const o = {
    ...parseOptions(options),
    ...parseOptions(extra)
  };

  let hasVolatile = false;

  const typeNames = o.types || parseArgumentNames(o.handler);
  const types = typeNames.map(name => {
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
        if (type.volatile) {
          // delegation
          if (o.targetClass && !getClosestOfClass(e.target, o.targetClass)) {
            return;
          } else if (o.target && !contain(o.target, e.target)) {
            return;
          }
        } else {
          cache[index] = e.detail;
        }

        if (!hasVolatile || type.volatile) {
          if (o.defer) {
            clearTimeout(deferTimeout);
            deferTimeout = setTimeout(callHandler, o.defer);
          } else {
            callHandler();
          }
        }

        function callHandler() {
          if (type.volatile) {
            const args = cache.slice(0);
            args[index] = type.full ? e : e.detail;
            o.handler.apply(null, args);
          } else {
            o.handler.apply(null, cache);
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
  if (!els || (!els.addEventListener && els.length === 0)) return;

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
  if (!els || (!els.addEventListener && els.length === 0)) return;

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

function parseOptions(options) {
  if (typeof options === "string") return { types: split(options) };
  if (Array.isArray(options)) return { types: options };
  if (typeof options === "function") return { handler: options };
  if (!options) return {};
  if (typeof options.types === "string")
    return {
      ...options,
      types: split(options.types)
    };
  return options;
}

function parseArgumentNames(fn) {
  const m = fn
    .toString()
    .match(/^function[^(]*\(([^)]*)\)|^\(([^)]*)\)|^([a-zA-Z$_][^=]*)/);
  const args = m[1] || m[2] || m[3];

  return split(args).filter(arg => !!arg);
}

function split(csv) {
  return csv.split(",").map(v => v.trim());
}
