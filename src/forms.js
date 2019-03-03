import { forEach, firstOf } from "./util";

export function getValue(els) {
  const el = firstOf(els);

  if (!el) return;

  switch (el.tagName === "INPUT" ? el.type : el.tagName) {
    case "checkbox":
    case "radio":
      return !!el.checked;
    default:
      // text, hidden, password, textarea, etc.
      return el.value || "";
  }
}

export function setValue(els, value) {
  forEach(els, el => {
    const tagName = el.tagName;
    const val = toValue(value);
    let elValue, multiple;

    switch (tagName === "INPUT" ? el.type : tagName) {
      case "checkbox":
      case "radio":
        elValue = el.getAttribute("value") || "on";
        el.checked = Array.isArray(val)
          ? value.indexOf(elValue) >= 0
          : val === elValue;
        break;
      case "SELECT":
        multiple = el.multiple && Array.isArray(val);

        forEach(el.options, option => {
          const optionValue = option.value || option.textContent;
          option.selected = multiple
            ? value.indexOf(optionValue) >= 0
            : value + "" == optionValue;
        });

        break;
      case "OPTION":
      case "file":
      case "image":
      case "reset":
        break;

      default:
        // text, hidden, password, textarea, etc.
        if (el.value !== val + "") el.value = val;
        break;
    }
  });
}

export function toValue(value) {
  if (value === null || value === undefined || value === false) return "";
  if (value === true) return "on";
  if (Array.isArray(value)) return value.map(toValue);
  return value + "";
}
