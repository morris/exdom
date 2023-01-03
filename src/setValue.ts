export function setValue(el: HTMLElement, value: unknown) {
  switch (el.tagName) {
    case 'INPUT':
      return setValueOfInput(el as HTMLInputElement, value);
    case 'SELECT':
      return setValueOfSelect(el as HTMLSelectElement, value);
    case 'TEXTAREA':
      return setValueOfTextArea(el as HTMLTextAreaElement, value);
  }
}

function setValueOfInput(el: HTMLInputElement, value: unknown) {
  const v = toValue(value);

  switch (el.type) {
    case 'checkbox': {
      const elValue = el.getAttribute('value') || 'on';
      const checked = Array.isArray(v)
        ? v.indexOf(elValue) >= 0
        : v === elValue;

      if (el.checked !== checked) el.checked = checked;
      break;
    }
    case 'radio': {
      const elValue = el.getAttribute('value') || 'on';
      const checked = v === elValue;

      if (el.checked !== checked) el.checked = checked;
      break;
    }
    default: // text, password, email, ...
      if (Array.isArray(v)) break;
      if (el.value !== v) el.value = v;
      break;
  }
}

function setValueOfTextArea(el: HTMLTextAreaElement, value: unknown) {
  const v = toValue(value);

  if (!Array.isArray(v) && el.value !== v) el.value = v;
}

function setValueOfSelect(el: HTMLSelectElement, value: unknown) {
  const v = toValue(value);
  const multiple = el.multiple && Array.isArray(v);

  for (const option of el.options) {
    const optionValue = option.value || option.textContent;
    option.selected = multiple
      ? v.indexOf(optionValue as string) >= 0
      : v === optionValue;
  }
}

function toValue(value: unknown): string | string[] {
  if (value === null || value === undefined || value === false) return '';
  if (value === true) return 'on';
  if (Array.isArray(value)) return value.map(toValue) as string[];

  return `${value}`;
}
