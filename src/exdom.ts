/**
 * Type-safe event listener and dispatch signatures for the custom events
 * defined in `TDetails`.
 */
export type CustomEventTarget<TDetails> = {
  addEventListener<TType extends keyof TDetails>(
    type: TType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (ev: CustomEvent<TDetails[TType]>) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<TType extends keyof TDetails>(
    type: TType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (ev: CustomEvent<TDetails[TType]>) => any,
    options?: boolean | EventListenerOptions,
  ): void;

  dispatchEvent<TType extends keyof TDetails>(
    ev: _TypedCustomEvent<TDetails, TType>,
  ): void;
};

/**
 * Extends an element type with type-safe event listener signatures for the
 * custom events defined in `TDetails`.
 */
export type CustomEventElement<
  TDetails,
  TElement = HTMLElement,
> = CustomEventTarget<TDetails> & TElement;

/**
 * Internal declaration for the `typeof` trick below.
 * Never actually implemented.
 */
declare class _TypedCustomEvent<
  TDetails,
  TType extends keyof TDetails,
> extends CustomEvent<TDetails[TType]> {
  constructor(
    type: TType,
    eventInitDict: { detail: TDetails[TType] } & EventInit,
  );
}

/**
 * Typed custom event (technically a typed alias of `CustomEvent`).
 * Use with `CustomEventTarget.dispatchEvent` to infer `detail` types
 * automatically.
 */
export const TypedCustomEvent = (
  typeof CustomEvent !== 'undefined' ? CustomEvent : undefined
) as typeof _TypedCustomEvent;

//

/**
 * Escapes HTML in the given text.
 */
export function escapeHTML(text: string) {
  return text.replace(ESCAPE_HTML_CHAR_RX, escapeHTMLCharacter);
}

function escapeHTMLCharacter(character: string) {
  return ESCAPE_HTML_CHAR_MAP[character as keyof typeof ESCAPE_HTML_CHAR_MAP];
}

const ESCAPE_HTML_CHAR_RX = /[&<>"']/g;
const ESCAPE_HTML_CHAR_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

//

/**
 * Shortcut for `querySelector` with `:scope` prefix.
 */
export function qs<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string,
) {
  return scope.querySelector<T>(`:scope ${selectors}`);
}

/**
 * Shortcut for `querySelectorAll` with `:scope` prefix.
 */
export function qsa<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string,
) {
  return scope.querySelectorAll<T>(`:scope ${selectors}`);
}

/**
 * Shortcut for `querySelector` with `:scope` prefix.
 * Throws if no matching element is found.
 */
export function qsr<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string,
) {
  const el = scope.querySelector<T>(`:scope ${selectors}`);

  if (!el) {
    throw new Error(`No element matching ${selectors} in ${scope}`);
  }

  return el;
}

//

/**
 * Options for reconciliation.
 */
export interface ReconcileOptions<TItem, TChild extends HTMLElement> {
  /**
   * Target container
   */
  container: HTMLElement;
  /**
   * List of data items
   */
  items: TItem[];
  /**
   * Key function for item identification.
   * If omitted, `item.id` or `item.key` or `item` (if a string) or `index` is used.
   */
  key?: (item: TItem, index: number) => string;
  /**
   * Function that creates an element from a given data item
   */
  create: (item: TItem, index: number) => TChild;
  /**
   * Function that updates an existing element using the given data item
   */
  update?: (child: TChild, item: TItem, index: number) => void;
}

/**
 * Maps given data items to DOM elements and reconciles the result with the
 * existing elements in the given container.
 */
export function reconcile<TItem, TChild extends HTMLElement>(
  options: ReconcileOptions<TItem, TChild>,
) {
  const {
    container,
    items,
    key = reconcileDefaultKey,
    create,
    update,
  } = options;

  const toRemove = new Set(container.children) as Set<TChild>;
  const childrenByKey = new Map<string, TChild>();

  toRemove.forEach((child) => {
    const k = child.dataset.key;
    if (k) childrenByKey.set(k, child);
  });

  const children = items.map((item, index) => {
    const k = key(item, index);
    let child = childrenByKey.get(k);

    if (child) {
      toRemove.delete(child);
    } else {
      child = create(item, index);
      child.dataset.key = k;
    }

    if (update) {
      update(child, item, index);
    }

    return child;
  });

  toRemove.forEach((child) => container.removeChild(child));

  children.forEach((child, index) => {
    if (child !== container.children[index]) {
      container.insertBefore(child, container.children[index]);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reconcileDefaultKey(item: any, index: number): string {
  if (typeof item === 'string') {
    return item;
  }

  if (item) {
    if (typeof item.id === 'string') {
      return item.id;
    }

    if (typeof item.key === 'string') {
      return item.key;
    }
  }

  return index.toString();
}

//

const requestAnimationFrameOnceSet = new Set<() => void>();

/**
 * Request the given callback to be called exactly once in the next animation
 * frame.
 */
export function requestAnimationFrameOnce(callback: () => void) {
  const before = requestAnimationFrameOnceSet.size;
  const after = requestAnimationFrameOnceSet.add(callback).size;

  if (after > before) {
    requestAnimationFrame(() => {
      requestAnimationFrameOnceSet.delete(callback);
      callback();
    });
  }
}

//

interface SetGuards {
  __setText?: string | typeof NaN;
  __setHTML?: string | typeof NaN;
  __setAttr?: Record<string, unknown>;
}

export function setAttr(
  el: HTMLElement,
  name: Record<string, string | number | boolean | null | undefined>,
): void;

export function setAttr(
  el: HTMLElement,
  name: string,
  value: string | number | boolean | null | undefined,
): void;

/**
 * Sets one or more attributes softly, i.e. does not make any changes if the
 * attribute already has the probided value. Removes the attribute if the
 * provided value is `false` or `undefined` or `null`. Sets the attribute to
 * the empty string if the provided value is `true`.
 */
export function setAttr(
  el: HTMLElement,
  name: string | Record<string, string | number | boolean | null | undefined>,
  value?: string | number | boolean | null | undefined,
) {
  if (typeof name !== 'string') {
    for (const [key, v] of Object.entries(name)) {
      setAttr(el, key, v);
    }

    return;
  }

  const __setAttr = ((el as SetGuards).__setAttr =
    (el as SetGuards).__setAttr ?? {});

  if (
    !Object.prototype.hasOwnProperty.call(__setAttr, name) ||
    __setAttr[name] !== value
  ) {
    __setAttr[name] = value;

    if (value === false || value === undefined || value === null) {
      el.removeAttribute(name);
    } else if (value === true) {
      el.setAttribute(name, '');
    } else {
      el.setAttribute(
        name,
        typeof value === 'string' ? value : value.toString(),
      );
    }
  }
}

/**
 * Sets inner HTML softly, i.e. without changing anything if the inner HTML
 * already matches the given HTML.
 */
export function setHTML(el: HTMLElement, html: string) {
  if ((el as SetGuards).__setHTML !== html) {
    (el as SetGuards).__setHTML = html;
    // safe guard if setText() and setHTML() are used on the same element
    (el as SetGuards).__setText = NaN;
    el.innerHTML = html;
  }
}

/**
 * Sets inner text softly, i.e. without changing anything if the inner text
 * already matches the given text.
 */
export function setText(el: HTMLElement, text: string) {
  if ((el as SetGuards).__setText !== text) {
    (el as SetGuards).__setText = text;
    // safe guard if setText() and setHTML() are used on the same element
    (el as SetGuards).__setHTML = NaN;
    el.innerText = text;
  }
}

//

/**
 * Sets the value of an input, select, or textarea softly, i.e. without changing
 * anything if the current input value already matches the given value.
 */
export function setValue(el: HTMLElement, value: unknown) {
  switch (el.tagName) {
    case 'INPUT':
      return setValueOfInput(el as HTMLInputElement, value);
    case 'SELECT':
      return setValueOfSelect(el as HTMLSelectElement, value);
    case 'TEXTAREA':
      return setValueOfTextArea(el as HTMLTextAreaElement, value);
  }
}

function setValueOfInput(el: HTMLInputElement, value: unknown) {
  const v = toValue(value);

  switch (el.type) {
    case 'checkbox': {
      const elValue = el.getAttribute('value') || 'on';
      const checked = Array.isArray(v)
        ? v.indexOf(elValue) >= 0
        : v === elValue;

      if (el.checked !== checked) el.checked = checked;
      break;
    }
    case 'radio': {
      const elValue = el.getAttribute('value') || 'on';
      const checked = v === elValue;

      if (el.checked !== checked) el.checked = checked;
      break;
    }
    default: // text, password, email, ...
      if (Array.isArray(v)) break;
      if (el.value !== v) el.value = v;
      break;
  }
}

function setValueOfTextArea(el: HTMLTextAreaElement, value: unknown) {
  const v = toValue(value);

  if (!Array.isArray(v) && el.value !== v) {
    el.value = v;
  }
}

function setValueOfSelect(el: HTMLSelectElement, value: unknown) {
  const v = toValue(value);
  const multiple = el.multiple && Array.isArray(v);

  for (const option of el.options) {
    const optionValue = option.value || option.textContent;
    option.selected = multiple
      ? v.indexOf(optionValue as string) >= 0
      : v === optionValue;
  }
}

function toValue(value: unknown): string | string[] {
  if (value === null || value === undefined || value === false) return '';
  if (value === true) return 'on';
  if (Array.isArray(value)) return value.map(toValue) as string[];

  return `${value}`;
}
