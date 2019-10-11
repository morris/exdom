import { listen, emit } from "./events";
import { getWindow } from "./util";

export function sessionValue(el, key, def) {
  return storageValue(el, "sessionStorage", key, def);
}

export function localValue(el, key, def) {
  return storageValue(el, "localStorage", key, def);
}

export function storageValue(el, storageName, key, def) {
  if (typeof key === "object") {
    return Object.keys(key).forEach(k => {
      storageValue(el, storageName, k, key[k]);
    });
  }

  const window = getWindow(el);
  const storage = window[storageName];

  listen(el, key, e => {
    if (e.__storageValue) return;
    e.__storageValue = true;

    const raw = JSON.stringify(e.detail);

    if (raw !== storage[key]) {
      storage[key] = raw;
    }
  });

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
