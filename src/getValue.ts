export function getValue(el: HTMLElement) {
  switch (el.tagName) {
    case 'INPUT':
      return getValueOfInput(el as HTMLInputElement);
    case 'SELECT':
      return (el as HTMLSelectElement).value || '';
    case 'TEXTAREA':
      return (el as HTMLTextAreaElement).value || '';
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
