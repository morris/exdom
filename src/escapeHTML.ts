const escapeDiv = document.createElement('div');

export function escapeHTML(text: string) {
  escapeDiv.innerText = text;

  return escapeDiv.innerHTML;
}
