import { qs } from './qs.js';

/**
 * Shortcut for `querySelector` with `:scope` prefix;
 * throws if no matching element is found
 */
export function qsr<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string,
) {
  const el = qs<T>(scope, selectors);

  if (!el) {
    throw new Error(`No element matching ${selectors} in ${scope}`);
  }

  return el;
}
