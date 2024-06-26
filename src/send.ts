/**
 * Create and dispatch a non-bubbling custom event on the given target
 */
export function send<TDetails>(
  target: EventTarget,
  type: keyof TDetails,
  detail?: TDetails[typeof type],
): boolean {
  return target.dispatchEvent(
    new CustomEvent<typeof detail>(type as string, {
      detail,
      bubbles: false,
    }),
  );
}
