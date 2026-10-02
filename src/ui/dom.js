// Tiny DOM helpers. All authored text is inserted with textContent (never innerHTML),
// so content strings can't inject markup.

import { Pen } from '../render/ink.js';

/** el('div', { class: 'x', onclick: fn, 'aria-label': '...' }, [children]) */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/**
 * Inline markup for authored text:
 *   ~~struck~~   [[red pen]]   **bold**   *italic*
 */
export function inline(text) {
  const frag = document.createDocumentFragment();
  const re = /(~~.+?~~|\[\[.+?\]\]|\*\*.+?\*\*|\*[^*]+?\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) frag.append(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('~~')) frag.append(el('s', { class: 'strike', text: tok.slice(2, -2) }));
    else if (tok.startsWith('[[')) frag.append(el('span', { class: 'red-pen', text: tok.slice(2, -2) }));
    else if (tok.startsWith('**')) frag.append(el('strong', { text: tok.slice(2, -2) }));
    else frag.append(el('em', { text: tok.slice(1, -1) }));
    last = m.index + tok.length;
  }
  if (last < text.length) frag.append(text.slice(last));
  return frag;
}

/**
 * A small canvas drawn with the ink Pen. If `animate`, it re-draws on the boil
 * clock (10 Hz) so sketches inside documents breathe like the world does.
 * Returns { node, dispose }.
 */
export function sketchCanvas(draw, w, h, { animate = true, boil = () => 1, label = '' } = {}) {
  const canvas = el('canvas', { class: 'sketch', role: 'img', 'aria-label': label || 'Ink drawing' });
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.aspectRatio = `${w} / ${h}`;
  const ctx = canvas.getContext('2d');
  const pen = new Pen(ctx);
  let tick = 0;
  const paint = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pen.tick = tick;
    pen.amp = boil();
    try {
      draw(pen, w, h, tick);
    } catch (err) {
      console.error('[sketch] draw failed', err);
    }
  };
  paint();
  let timer = null;
  if (animate) {
    timer = setInterval(() => {
      if (!canvas.isConnected) return;
      if (boil() > 0) tick++;
      paint();
    }, 100);
  }
  return {
    node: canvas,
    repaint: paint,
    dispose: () => timer && clearInterval(timer),
  };
}
