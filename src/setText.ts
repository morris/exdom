import type { Guards } from './internal/Guards.js';

/**
 * Sets inner text softly, i.e. without changing anything if the inner text
 * already matches the given text.
 */
export function setText(el: HTMLElement, text: string) {
  if ((el as Guards).__setText !== text) {
    (el as Guards).__setText = text;
    // safe guard if setText() and setHTML() are used on the same element
    (el as Guards).__setHTML = NaN;
    el.innerText = text;
  }
}
