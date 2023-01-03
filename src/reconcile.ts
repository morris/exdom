export interface ReconcileOptions<TItem, TChild extends HTMLElement> {
  container: HTMLElement;
  items: TItem[];
  getKey?: (item: TItem) => string;
  keyAttr?: string;
  create: (item: TItem) => TChild;
  update: (child: TChild, item: TItem) => unknown;
}

export function reconcile<TItem, TChild extends HTMLElement>(
  options: ReconcileOptions<TItem, TChild>
) {
  const getKeyInput = options.getKey;
  const getKey =
    typeof getKeyInput === 'function'
      ? getKeyInput
      : typeof getKeyInput === 'string'
      ? (item: TItem) => item[getKeyInput]
      : (item: TItem) =>
          (item as { id?: string }).id ?? (item as { key?: string }).key;

  const container = options.container;
  const keyAttr = options.keyAttr ?? 'key';

  const removed = new Set(container.children) as Set<HTMLElement>;
  const childrenByKey = new Map();

  removed.forEach((child) => childrenByKey.set(child.dataset[keyAttr], child));

  const children = options.items.map((item) => {
    const key = getKey(item);
    let child = childrenByKey.get(key);

    if (child) {
      removed.delete(child);
    } else {
      child = options.create(item);
      child.dataset[keyAttr] = key;
    }

    options.update(child, item);

    return child;
  });

  removed.forEach((child) => container.removeChild(child));

  children.forEach((child, index) => {
    if (child !== container.children[index]) {
      container.insertBefore(child, container.children[index]);
    }
  });
}
