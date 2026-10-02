// Procedural aged paper. Generated once per room (and cached) — never per frame.

import { mulberry32 } from '../core/math.js';

const cache = new Map();

/**
 * @param {number} w logical width
 * @param {number} h logical height
 * @param {number} scale device pixels per logical pixel
 * @param {number} seed
 */
export function makePaper(w, h, scale, seed = 7) {
  const key = `${w}x${h}@${scale.toFixed(3)}#${seed}`;
  if (cache.has(key)) return cache.get(key);
  // Keep the cache small: rooms are revisited, sizes rarely change.
  if (cache.size > 6) cache.delete(cache.keys().next().value);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const c = canvas.getContext('2d');
  const R = mulberry32(seed);
  c.scale(scale, scale);

  c.fillStyle = '#e8e0cc';
  c.fillRect(0, 0, w, h);

  // Fibres.
  const fibres = Math.round((w * h) / 110);
  for (let i = 0; i < fibres; i++) {
    c.strokeStyle = `rgba(90,70,50,${0.03 + R() * 0.05})`;
    c.lineWidth = 0.6;
    const x = R() * w;
    const y = R() * h;
    const a = R() * Math.PI;
    const len = 4 + R() * 8;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    c.stroke();
  }

  // Tea stains and foxing.
  const stains = Math.round(w / 90);
  for (let i = 0; i < stains; i++) {
    const x = R() * w;
    const y = R() * h;
    const r = 40 + R() * 110;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(150,110,60,0.09)');
    g.addColorStop(0.8, 'rgba(150,110,60,0.05)');
    g.addColorStop(1, 'rgba(150,110,60,0)');
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < w / 12; i++) {
    c.fillStyle = `rgba(130,90,50,${0.05 + R() * 0.08})`;
    c.beginPath();
    c.arc(R() * w, R() * h, 0.6 + R() * 1.6, 0, Math.PI * 2);
    c.fill();
  }

  // Darkened edges top and bottom (the page edge of a journal).
  const edge = c.createLinearGradient(0, 0, 0, h);
  edge.addColorStop(0, 'rgba(80,60,40,0.22)');
  edge.addColorStop(0.08, 'rgba(80,60,40,0)');
  edge.addColorStop(0.92, 'rgba(80,60,40,0)');
  edge.addColorStop(1, 'rgba(80,60,40,0.25)');
  c.fillStyle = edge;
  c.fillRect(0, 0, w, h);

  cache.set(key, canvas);
  return canvas;
}
