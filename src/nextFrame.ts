const queue = new Set<() => unknown>();

/**
 * Enqueue the given function(s) to be called once on the next animation frame
 */
export function nextFrame(...fns: Array<() => unknown>) {
  if (queue.size === 0) {
    requestAnimationFrame(() => {
      for (const fn of queue) {
        try {
          fn();
        } catch (error) {
          document.dispatchEvent(new ErrorEvent('error', { error }));
        }
      }

      queue.clear();
    });
  }

  for (const fn of fns) {
    queue.add(fn);
  }
}
