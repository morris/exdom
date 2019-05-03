import { listen, emit } from "./events";
import { getWindow } from "./util";

export function sessionValue(els, key, def) {
  return storageValue(els, "sessionStorage", key, def);
}

export function localValue(els, key, def) {
  return storageValue(els, "localStorage", key, def);
}

export function storageValue(els, storageName, key, def) {
  if (typeof key === "object") {
    return Object.keys(key).forEach(k => {
      storageValue(els, storageName, k, key[k]);
    });
  }

  const storage = getWindow(els)[storageName];

  listen(els, key, e => {
    if (e.__storageValue) return;
    e.__storageValue = true;

    const raw = JSON.stringify(e.detail);

    if (raw !== storage[key]) {
      storage[key] = raw;
    }
  });

  listen(els, "readStorage", () => {
    const raw = storage[key];

    if (typeof raw === "string") {
      try {
        return emit(els, key, JSON.parse(raw));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }

    emit(els, key, def);
  });
}
