import type { CustomEventTarget } from './CustomEventTarget.js';

/**
 * Extends an element type with type-safe event listener signatures for the
 * events defined in `TDetails`.
 */
export type CustomEventElement<
  TDetails,
  TElement = HTMLElement,
> = CustomEventTarget<TDetails> & TElement;
