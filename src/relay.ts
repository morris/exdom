import { send } from './send.js';

export function relay<TDetails>(
  source: EventTarget,
  type: keyof TDetails,
  targets: EventTarget[]
) {
  source.addEventListener(type as string, (e) => {
    for (const target of targets) {
      send(target, e.type, (e as CustomEvent).detail);
    }
  });
}
