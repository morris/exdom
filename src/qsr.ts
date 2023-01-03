import { qs } from './qs.js';

export function qsr<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string
) {
  const el = qs<T>(scope, selectors);

  if (!el) {
    throw new Error(`No element matching ${selectors} in ${scope}`);
  }

  return el;
}
