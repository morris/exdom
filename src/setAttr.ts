import type { Guards } from './internal/Guards.js';

export function setAttr(
  el: HTMLElement,
  name: Record<string, string | number | true | null | undefined>,
): void;

export function setAttr(
  el: HTMLElement,
  name: string,
  value: string | number | true | null | undefined,
): void;

/**
 * Sets one or more attributes softly, i.e. does not make any changes if the
 * attribute already has the probided value. Removes the attribute if the
 * provided value is `undefined` or `null`.
 */
export function setAttr(
  el: HTMLElement,
  name: string | Record<string, string | number | true | null | undefined>,
  value?: string | number | true | null | undefined,
) {
  if (typeof name !== 'string') {
    for (const [key, v] of Object.entries(name)) {
      setAttr(el, key, v);
    }

    return;
  }

  const __setAttr = ((el as Guards).__setAttr = (el as Guards).__setAttr ?? {});

  if (!__setAttr.hasOwnProperty(name) || __setAttr[name] !== value) {
    __setAttr[name] = value;

    if (value === undefined || value === null) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, `${value}`);
    }
  }
}
