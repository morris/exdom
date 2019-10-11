import { getWindow } from "./util";
import { matches } from "./selector";

export function observe(el, eventSelectors, handler) {
  const es = Array.isArray(eventSelectors) ? eventSelectors : [eventSelectors];
  const types = [];
  const cache = {};
  let triggerRequired = false;

  es.forEach(o => {
    parseEventSelector(o).forEach(it => {
      if (it.trigger) triggerRequired = true;
      types.push(it);
    });
  });

  types.forEach(type => {
    const { name, trigger, selector } = type;

    listen(el, name, e => {
      if (selector && !matches(e.target, selector, el)) return;
      if (!trigger) {
        cache[name] = e.detail;
        if (triggerRequired) return;
      }

      const details = { ...cache };
      if (trigger) details[name] = e.detail;

      handler(details, e);
    });
  });
}

export function listen(el, type, handler, options) {
  const h = e => {
    try {
      return handler(e);
    } catch (err) {
      emit(el, "error", err);
    }
  };

  el.addEventListener(type, h, options || false);

  return h;
}

export function emit(el, type, detail) {
  dispatch(el, type, detail, true);
}

export function send(el, type, detail) {
  dispatch(el, type, detail, false);
}

export function dispatch(el, type, detail, bubbles) {
  if (typeof type === "object") {
    Object.keys(type).forEach(t => {
      dispatch(el, t, type[t], bubbles);
    });

    return;
  }

  const { CustomEvent } = getWindow(el);

  try {
    el.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles
      })
    );
  } catch (err) {
    try {
      el.dispatchEvent(
        new CustomEvent("error", {
          err,
          bubbles: true
        })
      );
    } catch (err_) {
      // last resort
      console.error(err); // eslint-disable-line no-console
      console.error(err_); // eslint-disable-line no-console
    }
  }
}

//

function parseEventSelector(eventSelector) {
  const s = eventSelector.split(/@/);

  return s[0]
    .split(/[\s,]+/)
    .filter(type => type.length > 0)
    .map(type => {
      const trigger = type[0] === "$";

      return {
        name: trigger ? type.slice(1) : type,
        trigger,
        selector: s[1]
      };
    });
}
