import type { CustomEventTarget } from './CustomEventTarget.js';

export type CustomEventElement<
  TCustomEventDetails,
  TElement = HTMLElement
> = CustomEventTarget<TCustomEventDetails> & TElement;
