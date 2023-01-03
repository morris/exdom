import type { CustomEventTarget } from './CustomEventTarget.js';

export type CustomEventElement<
  TDetails,
  TElement = HTMLElement
> = CustomEventTarget<TDetails> & TElement;
