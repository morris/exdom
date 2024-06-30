import { send } from './send.js';

/**
 * Relays events of the given type dispatched on the given source
 * to the given targets (by dispatching as non-bubbling custom events).
 */
export function relay<TDetails>(
  source: EventTarget,
  type: keyof TDetails,
  targets: EventTarget[],
) {
  source.addEventListener(type as string, (e) => {
    for (const target of targets) {
      send(target, e.type, (e as CustomEvent).detail);
    }
  });
}
