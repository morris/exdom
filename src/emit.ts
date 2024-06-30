/**
 * Create and dispatch a bubbling custom event from the given target
 */
export function emit<TDetails>(
  target: EventTarget,
  type: keyof TDetails,
  detail?: TDetails[typeof type],
) {
  return target.dispatchEvent(
    new CustomEvent<typeof detail>(type as string, {
      detail,
      bubbles: true,
    }),
  );
}
