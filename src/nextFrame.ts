const queue = new Set<() => unknown>();

/**
 * Enqueue the given function(s) to be called once on the next animation frame
 */
export function nextFrame(...fns: Array<() => unknown>) {
  if (queue.size === 0) {
    requestAnimationFrame(() => {
      const tmp = Array.from(queue);
      queue.clear();

      for (const fn of tmp) {
        try {
          fn();
        } catch (error) {
          document.dispatchEvent(new ErrorEvent('error', { error }));
        }
      }
    });
  }

  for (const fn of fns) {
    queue.add(fn);
  }
}
