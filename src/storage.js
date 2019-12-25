import { listen, emit } from "./events";
import { getWindow } from "./util";

export function store(el, storageName, key) {
  if (Array.isArray(key)) {
    for (const k of key) {
      store(el, storageName, k);
    }

    return;
  }

  const window = getWindow(el);
  const storage = window[storageName];

  listen(el, key, event => {
    if (event.__stored) return;
    event.__stored = true;

    const raw = JSON.stringify(event.detail);

    if (raw !== storage[key]) {
      storage[key] = raw;
    }
  });
}

export function restore(el, storageName, key, def) {
  if (typeof key === "object") {
    for (const k of Object.keys(key)) {
      restore(el, storageName, k, key[k]);
    }

    return;
  }

  const window = getWindow(el);
  const storage = window[storageName];

  const raw = storage[key];

  if (typeof raw === "string") {
    try {
      return emit(el, key, JSON.parse(raw));
    } catch (err) {
      console.warn(err); // eslint-disable-line no-console
    }
  }

  emit(el, key, def);
}
