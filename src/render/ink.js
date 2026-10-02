// Ink pen: every line in the game goes through here.
//
// Lines are drawn with a little positional jitter from a seeded PRNG. The seed is
// the current "boil tick" (re-seeded ~10x per second) mixed with a per-object salt,
// so a drawing is perfectly stable for 100 ms and then redraws itself slightly
// differently — the hand-drawn "line boil" — while motion stays smooth at 60 fps.

import { mulberry32, hashString } from '../core/math.js';

export const INK = '#1f1b1a';
export const RED = '#a8261f';
export const PAPER = '#e8e0cc';
export const PAPER_LIGHT = '#f2ebd9';
export const PAPER_DARK = '#d8cdb2';

export const FONT_TYPE = '"Special Elite", "Courier New", monospace';
export const FONT_HAND = '"Caveat", "Segoe Print", "Comic Sans MS", cursive';

export class Pen {
  /** @param {CanvasRenderingContext2D} ctx */
  constructor(ctx) {
    this.ctx = ctx;
    this.tick = 0;
    /** Global jitter multiplier (settings: line boil + CO haze). */
    this.amp = 1;
    this.R = mulberry32(1);
  }

  /** Re-seed for a named object so its jitter is stable within the tick. */
  begin(salt) {
    const s = typeof salt === 'number' ? salt : hashString(String(salt));
    this.R = mulberry32((this.tick * 977 + s) | 0);
    return this;
  }

  J(a = 1.1) {
    return (this.R() - 0.5) * 2 * a * this.amp;
  }

  rand() {
    return this.R();
  }

  /** A single wobbly stroke made of `passes` overlapping quadratic curves. */
  line(x1, y1, x2, y2, o = {}) {
    const { w = 1.4, col = INK, passes = 2, alpha = 1, j = 1.1 } = o;
    const c = this.ctx;
    c.strokeStyle = col;
    c.lineWidth = w;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const prevAlpha = c.globalAlpha;
    c.globalAlpha = prevAlpha * alpha;
    for (let p = 0; p < passes; p++) {
      c.beginPath();
      c.moveTo(x1 + this.J(j), y1 + this.J(j));
      const mx = (x1 + x2) / 2 + this.J(j * 1.5);
      const my = (y1 + y2) / 2 + this.J(j * 1.5);
      c.quadraticCurveTo(mx, my, x2 + this.J(j), y2 + this.J(j));
      c.stroke();
    }
    c.globalAlpha = prevAlpha;
  }

  /** Polyline through points [[x,y],...]. */
  poly(points, o = {}) {
    const { closed = false } = o;
    for (let i = 0; i < points.length - 1; i++) this.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], o);
    if (closed && points.length > 2) {
      const a = points[points.length - 1];
      this.line(a[0], a[1], points[0][0], points[0][1], o);
    }
  }

  rect(x, y, w, h, o = {}) {
    this.line(x, y, x + w, y, o);
    this.line(x + w, y, x + w, y + h, o);
    this.line(x + w, y + h, x, y + h, o);
    this.line(x, y + h, x, y, o);
  }

  /** Wobbly circle/ellipse outline. `frac` (0..1) draws only part of it (for reveal animations). */
  ellipse(x, y, rx, ry, o = {}) {
    const { w = 1.3, col = INK, alpha = 1, frac = 1, j = 1, steps = 24, overshoot = 0.08 } = o;
    const c = this.ctx;
    c.strokeStyle = col;
    c.lineWidth = w;
    c.lineCap = 'round';
    const prevAlpha = c.globalAlpha;
    c.globalAlpha = prevAlpha * alpha;
    c.beginPath();
    const a0 = this.R() * Math.PI * 2;
    const total = Math.PI * 2 * (1 + overshoot) * frac;
    const n = Math.max(2, Math.ceil(steps * (1 + overshoot) * frac));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * total;
      const px = x + Math.cos(a) * (rx + this.J(j));
      const py = y + Math.sin(a) * (ry + this.J(j));
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
    c.globalAlpha = prevAlpha;
  }

  circle(x, y, r, o = {}) {
    this.ellipse(x, y, r, r, o);
  }

  /** Solid shape filled with paper so it hides what is behind it. */
  fillPoly(points, col = PAPER_LIGHT, alpha = 1) {
    const c = this.ctx;
    const prev = c.globalAlpha;
    c.globalAlpha = prev * alpha;
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
    c.closePath();
    c.fill();
    c.globalAlpha = prev;
  }

  fillRect(x, y, w, h, col = PAPER_LIGHT, alpha = 1) {
    const c = this.ctx;
    const prev = c.globalAlpha;
    c.globalAlpha = prev * alpha;
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
    c.globalAlpha = prev;
  }

  fillEllipse(x, y, rx, ry, col = PAPER_LIGHT, alpha = 1) {
    const c = this.ctx;
    const prev = c.globalAlpha;
    c.globalAlpha = prev * alpha;
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = prev;
  }

  /**
   * Parallel hatching clipped to a rectangle. `dir` is the slope (1 = "/", -1 = "\"),
   * `gap` the spacing. Cross-hatch = two calls with opposite dir.
   */
  hatch(x, y, w, h, o = {}) {
    const { gap = 4, dir = 1, w: lw = 0.8, col = INK, alpha = 0.85 } = o;
    const c = this.ctx;
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    for (let i = -h; i < w + h; i += gap) {
      const jx = this.J(0.6);
      if (dir > 0) this.line(x + i + jx, y + h, x + i + h + jx, y, { w: lw, col, passes: 1, alpha, j: 0.7 });
      else this.line(x + i + jx, y, x + i + h + jx, y + h, { w: lw, col, passes: 1, alpha, j: 0.7 });
    }
    c.restore();
  }

  /** Hatching clipped to an arbitrary polygon. */
  hatchPoly(points, o = {}) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const c = this.ctx;
    c.save();
    c.beginPath();
    c.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
    c.closePath();
    c.clip();
    this.hatch(x, y, Math.max(...xs) - x, Math.max(...ys) - y, o);
    c.restore();
  }

  crossHatch(x, y, w, h, o = {}) {
    this.hatch(x, y, w, h, { ...o, dir: 1 });
    this.hatch(x, y, w, h, { ...o, dir: -1, gap: (o.gap || 4) * 1.25 });
  }

  /** Vertical-ish scribble used for crossing things out and filling small dark shapes. */
  scribble(x, y, w, h, o = {}) {
    const { col = INK, w: lw = 1.1, density = 9, alpha = 1, frac = 1 } = o;
    const c = this.ctx;
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.lineJoin = 'round';
    const prev = c.globalAlpha;
    c.globalAlpha = prev * alpha;
    c.beginPath();
    const n = Math.max(1, Math.floor(density * frac));
    c.moveTo(x + this.J(1), y + this.J(1));
    for (let i = 0; i <= n; i++) {
      const px = x + (i / density) * w + this.J(1.2);
      const py = i % 2 ? y + h + this.J(1.5) : y + this.J(1.5);
      c.lineTo(px, py);
    }
    c.stroke();
    c.globalAlpha = prev;
  }

  /** Big hand-drawn X. */
  cross(x, y, w, h, o = {}) {
    const frac = o.frac ?? 1;
    const f1 = Math.min(1, frac * 2);
    const f2 = Math.max(0, frac * 2 - 1);
    if (f1 > 0) this.line(x, y, x + w * f1, y + h * f1, { col: RED, w: 1.8, ...o });
    if (f2 > 0) this.line(x + w, y, x + w - w * f2, y + h * f2, { col: RED, w: 1.8, ...o });
  }

  /** Text in a given font. `reveal` (0..1) clips it left-to-right for writing-in animations. */
  text(str, x, y, o = {}) {
    const { size = 14, col = INK, font = FONT_HAND, rot = 0, align = 'left', alpha = 1, reveal = 1, weight = '' } = o;
    const c = this.ctx;
    c.save();
    c.translate(x + this.J(0.3), y + this.J(0.3));
    c.rotate(rot);
    c.font = `${weight} ${size}px ${font}`.trim();
    c.textAlign = align;
    c.textBaseline = 'alphabetic';
    c.fillStyle = col;
    c.globalAlpha *= alpha;
    if (reveal < 1) {
      const width = c.measureText(str).width;
      const startX = align === 'center' ? -width / 2 : align === 'right' ? -width : 0;
      c.beginPath();
      c.rect(startX - 2, -size * 1.4, width * reveal + 2, size * 2);
      c.clip();
    }
    c.fillText(str, 0, 0);
    c.restore();
  }

  /** Underline/strike helper for annotations. */
  underline(x, y, w, o = {}) {
    this.line(x, y, x + w * (o.frac ?? 1), y + this.J(1), { col: RED, w: 1.4, ...o });
  }

  /** Arrow from (x1,y1) to (x2,y2) with a hand-drawn head. */
  arrow(x1, y1, x2, y2, o = {}) {
    const frac = o.frac ?? 1;
    const ex = x1 + (x2 - x1) * frac;
    const ey = y1 + (y2 - y1) * frac;
    this.line(x1, y1, ex, ey, { col: RED, w: 1.4, ...o });
    if (frac < 0.95) return;
    const a = Math.atan2(y2 - y1, x2 - x1);
    this.line(x2, y2, x2 - Math.cos(a - 0.5) * 8, y2 - Math.sin(a - 0.5) * 8, { col: RED, w: 1.4, ...o });
    this.line(x2, y2, x2 - Math.cos(a + 0.5) * 8, y2 - Math.sin(a + 0.5) * 8, { col: RED, w: 1.4, ...o });
  }
}
