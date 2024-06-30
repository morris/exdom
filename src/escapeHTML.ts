const escapeDiv = document.createElement('div');

/**
 * Escapes any HTML in the given text.
 */
export function escapeHTML(text: string) {
  escapeDiv.innerText = text;

  return escapeDiv.innerHTML;
}
