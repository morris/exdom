import { listen, emit } from "./events";
import { getWindow } from "./util";

export function readLocal(el, key, def) {
  return readStorage(el, "localStorage", key, def);
}

export function readSession(el, key, def) {
  return readStorage(el, "sessionStorage", key, def);
}

export function writeLocal(el, key) {
  return writeStorage(el, "localStorage", key);
}

export function writeSession(el, key) {
  return writeStorage(el, "sessionStorage", key);
}

export function readStorage(el, storageName, key, def) {
  if (typeof key === "object") {
    return Object.keys(key).forEach(k => {
      readStorage(el, storageName, k, key[k]);
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

export function writeStorage(el, storageName, key) {
  if (Array.isArray(key)) {
    return key.forEach(k => {
      writeStorage(el, storageName, k);
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
}
