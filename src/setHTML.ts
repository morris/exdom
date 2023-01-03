import type { Guards } from './internal/Guards.js';

export function setHTML(el: HTMLElement, html: string) {
  if ((el as Guards).__setHTML !== html) {
    (el as Guards).__setHTML = html;
    // safe guard if setText() and setHTML() are used on the same element
    (el as Guards).__setText = NaN;
    el.innerHTML = html;
  }
}
