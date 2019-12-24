import { listen, emit } from "./events";
import { getWindow } from "./util";

export function store(el, storageName, key) {
  if (Array.isArray(key)) {
    return key.forEach(k => {
      store(el, storageName, k);
    });
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
    return Object.keys(key).forEach(k => {
      restore(el, storageName, k, key[k]);
    });
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
