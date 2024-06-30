/**
 * Gets value of the given element, which can be an input of any type as well as
 * a select or a textarea. Returns undefined otherwise.
 */
export function getValue(el: HTMLElement) {
  switch (el.tagName) {
    case 'INPUT':
      return getValueOfInput(el as HTMLInputElement);
    case 'SELECT':
    case 'TEXTAREA':
      return (el as HTMLSelectElement | HTMLTextAreaElement).value || '';
    default:
      return undefined;
  }
}

function getValueOfInput(el: HTMLInputElement) {
  switch (el.type) {
    case 'checkbox':
    case 'radio':
      return !!el.checked;
    default: // text, password, email, ...
      return el.value || '';
  }
}
