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
   * Key name or function for item identification.
   * If omitted, `item.id` or `item.key` are used.
   */
  key?: string | ((item: TItem) => string);
  /**
   * Function that creates an element from a given data item
   */
  create: (item: TItem) => TChild;
  /**
   * Function that updates an existing element using the given data item
   */
  update: (child: TChild, item: TItem) => unknown;
}

/**
 * Maps given data items to DOM elements and reconciles the result with the
 * existing elements in the given container.
 */
export function reconcile<TItem, TChild extends HTMLElement>(
  options: ReconcileOptions<TItem, TChild>
) {
  const { container, items, key, create, update } = options;

  const getKey =
    typeof key === 'function'
      ? key
      : typeof key === 'string'
      ? (item: TItem) => (item as Record<string, unknown>)[key]
      : (item: TItem) =>
          (item as { id?: unknown }).id ?? (item as { key?: unknown }).key;

  const toRemove = new Set(container.children) as Set<HTMLElement>;
  const childrenByKey = new Map();

  toRemove.forEach((child) => childrenByKey.set(child.dataset.key, child));

  const children = items.map((item) => {
    const key = `${getKey(item)}`;
    let child = childrenByKey.get(key);

    if (child) {
      toRemove.delete(child);
    } else {
      child = create(item);
      child.dataset.key = key;
    }

    update(child, item);

    return child;
  });

  toRemove.forEach((child) => container.removeChild(child));

  children.forEach((child, index) => {
    if (child !== container.children[index]) {
      container.insertBefore(child, container.children[index]);
    }
  });
}
