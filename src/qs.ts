/**
 * Shortcut for `querySelector` with `:scope` prefix
 */
export function qs<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string,
) {
  return scope.querySelector<T>(`:scope ${selectors}`);
}
