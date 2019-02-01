import { forEach } from "./util";

export function getValue(els) {
  const el = els && els.addEventListener ? els : els[0];

  if (!el) return;

  switch (el.tagName === "INPUT" ? el.type : el.tagName) {
    case "text":
    case "password":
    case "SELECT":
      return el.value || "";
    case "TEXTAREA":
      return el.value;
    case "checkbox":
      return !!el.checked;
    default:
      return;
  }
}

export function setValue(els, value) {
  forEach(els, el => {
    const tagName = el.tagName;
    const val = toValue(value);
    let elValue, multiple;

    switch (tagName === "INPUT" ? el.type : tagName) {
      case "text":
      case "password":
      case "TEXTAREA":
        if (el.value !== val + "") el.value = val;
        break;
      case "checkbox":
        elValue = el.getAttribute("value") || "on";
        el.checked = Array.isArray(val)
          ? value.indexOf(elValue) >= 0
          : val === elValue;
        break;
      case "radio":
        // TODO
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
    }
  });
}

export function toValue(value) {
  if (value === null || value === undefined || value === false) return "";
  if (value === true) return "on";
  if (Array.isArray(value)) return value.map(toValue);
  return value + "";
}
