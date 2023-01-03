export type CustomEventTarget<TDetails> = {
  addEventListener<K extends keyof TDetails>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: HTMLElement, ev: CustomEvent<TDetails[K]>) => any,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener<K extends keyof TDetails>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: HTMLElement, ev: CustomEvent<TDetails[K]>) => any,
    options?: boolean | EventListenerOptions
  ): void;
};
