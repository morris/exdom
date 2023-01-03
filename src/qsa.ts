/**
 * Shortcut for `querySelectorAll` with `:scope` prefix
 */
export function qsa<T extends Element = HTMLElement>(
  scope: ParentNode,
  selectors: string
) {
  return scope.querySelectorAll<T>(`:scope ${selectors}`);
}
