const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

let overlay: HTMLDivElement;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; pointer-events: none; z-index: 2147483647;
    border-radius: 6px; padding: 8px; font: 12px/1.2 system-ui;
    background: #fff; border: 1px solid #ccc; box-shadow: 0 6px 20px rgba(0,0,0,.2);
  `;
  document.body.appendChild(overlay);
}

function getColorAt(x: number, y: number) {
  const node = document.elementFromPoint(x, y) as HTMLElement;
  if (!node) return null;
  const style = getComputedStyle(node);
  const color = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)'
    ? style.backgroundColor
    : style.color;
  return color;
}

function rgbaToComponents(rgba: string) {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  return match[1].split(',').map(x => parseFloat(x.trim()));
}

function onMove(e: MouseEvent) {
  if (!overlay) return;
  overlay.style.left = e.clientX + 14 + 'px';
  overlay.style.top = e.clientY + 14 + 'px';
  const colorStr = getColorAt(e.clientX, e.clientY);
  if (!colorStr) return;
  const comp = rgbaToComponents(colorStr);
  if (!comp) return;
  const hex = toHex(comp[0], comp[1], comp[2]);
  overlay.textContent = hex;
}

function onClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  const colorStr = getColorAt(e.clientX, e.clientY);
  if (!colorStr) return;
  const comp = rgbaToComponents(colorStr);
  if (!comp) return;
  const hex = toHex(comp[0], comp[1], comp[2]);

  navigator.clipboard.writeText(hex);

  chrome.storage.local.get({ colors: [] }, (res) => {
    const colors = res.colors as string[];
    chrome.storage.local.set({ colors: [hex, ...colors.filter(c => c !== hex)].slice(0, 50) }); // max 50 colors
  });
}

function startPicker() {
  if (!overlay) createOverlay();
  document.addEventListener('mousemove', onMove);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') stopPicker(); });
}

function stopPicker() {
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('click', onClick, true);
  if (overlay) overlay.remove();
  overlay = null!;
}

startPicker();
