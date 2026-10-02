// Shared ink drawing helpers for the Wexley House rooms. Coordinates are logical:
// the back wall meets the floor at y = 256; the player walks at y ≈ 304.

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../render/ink.js';
import { mulberry32 } from '../core/math.js';

export const FLOOR = 256;

export function floorboards(pen, width) {
  pen.begin('floor');
  pen.line(0, FLOOR, width, FLOOR, { w: 1.8 });
  const rows = [268, 284, 306, 334];
  rows.forEach((y, i) => {
    pen.line(0, y, width, y, { w: 0.7, passes: 1, alpha: 0.55 });
    const prevY = i ? rows[i - 1] : FLOOR;
    for (let x = (i % 2) * 37 + 12; x < width; x += 74) pen.line(x, prevY + 1, x + 1, y - 1, { w: 0.6, passes: 1, alpha: 0.5 });
  });
  // Floor shadow toward the front edge.
  pen.hatch(0, 334, width, 26, { gap: 4, w: 0.5, alpha: 0.4 });
}

export function wallpaper(pen, width, top, bottom, { gap = 16, salt = 'wall' } = {}) {
  pen.begin(salt);
  for (let x = 6; x < width; x += gap) {
    pen.line(x, top + pen.J(3), x, bottom, { w: 0.45, passes: 1, alpha: 0.32 });
    // Little sprig pattern every so often.
    if ((x / gap) % 2 < 1) {
      for (let y = top + 24; y < bottom - 10; y += 46) pen.ellipse(x + gap / 2, y, 2.2, 3.2, { w: 0.5, alpha: 0.3, steps: 8 });
    }
  }
}

export function skirting(pen, width, y = 240) {
  pen.begin('skirting');
  pen.line(0, y, width, y, { w: 1 });
  pen.hatch(0, y, width, FLOOR - y, { gap: 2.4, dir: -1, w: 0.5, alpha: 0.7 });
}

/** Window frame with panes. Contents (sky, rain, sea) are drawn dynamically. */
export function windowFrame(pen, x, y, w, h, { salt = 'window', mullions = true } = {}) {
  pen.begin(salt);
  pen.rect(x - 6, y - 6, w + 12, h + 12, { w: 1.6 });
  pen.rect(x, y, w, h, { w: 1.1 });
  if (mullions) {
    pen.line(x + w / 2, y, x + w / 2, y + h, { w: 1.3 });
    pen.line(x, y + h * 0.48, x + w, y + h * 0.48, { w: 1.3 });
  }
  // Sill.
  pen.line(x - 12, y + h + 8, x + w + 12, y + h + 8, { w: 1.6 });
  pen.hatch(x - 12, y + h + 8, w + 24, 5, { gap: 2, w: 0.5 });
}

/**
 * Night outside the window: hatched sky, the sea line, the causeway, rain streaks,
 * and (optionally) a lantern bobbing on the causeway.
 */
export function windowNight(pen, x, y, w, h, t, { lantern = 0, salt = 'night' } = {}) {
  const c = pen.ctx;
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  pen.begin(`${salt}-sky`);
  pen.fillRect(x, y, w, h, 'rgba(40,34,40,0.55)');
  pen.hatch(x, y, w, h, { gap: 2.6, dir: 1, w: 0.5, alpha: 0.75 });
  const sea = y + h * 0.66;
  pen.line(x, sea, x + w, sea - 2, { w: 0.9, col: PAPER_LIGHT, alpha: 0.6 });
  // The causeway, a pale line running out to sea.
  pen.line(x + w * 0.1, y + h, x + w * 0.62, sea + 1, { w: 1.2, col: PAPER_LIGHT, alpha: 0.5 });
  if (lantern > 0) {
    const lx = x + w * (0.45 + 0.08 * Math.sin(t * 0.15));
    const ly = sea + 3 + Math.sin(t * 2.1) * 0.6;
    pen.fillEllipse(lx, ly, 3.2, 3.2, `rgba(242,235,217,${0.9 * lantern})`);
    pen.ellipse(lx, ly, 6, 6, { col: RED, w: 0.8, alpha: 0.6 * lantern });
  }
  // Rain: smooth motion, boiling strokes.
  const R = mulberry32(Math.floor(t * 10) * 13 + 7);
  c.strokeStyle = 'rgba(242,235,217,0.45)';
  c.lineWidth = 0.6;
  c.beginPath();
  for (let i = 0; i < 26; i++) {
    const rx = x + ((i * 37 + t * 160 + R() * 6) % (w + 30)) - 15;
    const ry = y + ((i * 53 + t * 420) % (h + 30)) - 15;
    c.moveTo(rx, ry);
    c.lineTo(rx - 3, ry + 9);
  }
  c.stroke();
  c.restore();
}

/** A closed panelled door. */
export function doorClosed(pen, x, y, w, h, { salt = 'door', knobSide = 1 } = {}) {
  pen.begin(salt);
  pen.rect(x - 5, y - 5, w + 10, h + 5, { w: 1.6 });
  pen.fillRect(x, y, w, h, PAPER_LIGHT, 0.35);
  pen.rect(x, y, w, h, { w: 1.2 });
  pen.rect(x + 7, y + 10, w - 14, h * 0.36, { w: 0.8 });
  pen.rect(x + 7, y + h * 0.5, w - 14, h * 0.42, { w: 0.8 });
  pen.hatch(x + 7, y + h * 0.5, w - 14, h * 0.42, { gap: 3.4, w: 0.4, alpha: 0.5 });
  const kx = knobSide > 0 ? x + w - 8 : x + 8;
  pen.circle(kx, y + h * 0.52, 2.6, { w: 1.1 });
  pen.fillEllipse(kx, y + h * 0.52 + 8, 1, 2.2, INK);
  // Gap under the door.
  pen.line(x + 2, y + h - 1, x + w - 2, y + h - 1, { w: 1.8 });
}

/** An open doorway: dark interior, the door leaf swung into the room. */
export function doorOpen(pen, x, y, w, h, { salt = 'door-open', swing = 1 } = {}) {
  pen.begin(salt);
  pen.rect(x - 5, y - 5, w + 10, h + 5, { w: 1.6 });
  pen.fillRect(x, y, w, h, 'rgba(31,27,26,0.55)');
  pen.crossHatch(x, y, w, h, { gap: 2.4, w: 0.6 });
  // Leaf in perspective.
  const lx = swing > 0 ? x + w : x;
  const d = 16 * swing;
  pen.fillPoly([[lx, y], [lx + d, y + 8], [lx + d, y + h - 4], [lx, y + h]], PAPER_LIGHT, 0.6);
  pen.poly([[lx, y], [lx + d, y + 8], [lx + d, y + h - 4], [lx, y + h]], { closed: true, w: 1.1 });
}

export function plaque(pen, text, x, y, size = 9) {
  pen.text(text, x, y, { size, font: FONT_TYPE, alpha: 0.85 });
}

/** Hand-drawn clock face with hands at h:m. */
export function clockFace(pen, cx, cy, r, hours, minutes, { w = 1.1 } = {}) {
  pen.circle(cx, cy, r, { w });
  pen.circle(cx, cy, r * 0.78, { w: w * 0.5 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    pen.line(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92, { w: 0.6, passes: 1 });
  }
  const mA = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  const hA = ((hours % 12) / 12 + minutes / 720) * Math.PI * 2 - Math.PI / 2;
  pen.line(cx, cy, cx + Math.cos(mA) * r * 0.8, cy + Math.sin(mA) * r * 0.8, { w: w * 0.9 });
  pen.line(cx, cy, cx + Math.cos(hA) * r * 0.5, cy + Math.sin(hA) * r * 0.5, { w: w * 1.3 });
}

/** Red candle flame, drawn after lighting so it stays bright. */
export function flame(pen, x, y, power, t) {
  const fh = 6 + power * 5;
  pen.fillEllipse(x, y - 4, 10 * power, 10 * power, 'rgba(168,38,31,0.10)');
  pen.begin(`flame-${Math.round(x)}`);
  for (let p = 0; p < 2; p++) {
    const c = pen.ctx;
    c.strokeStyle = RED;
    c.lineWidth = 1.3;
    c.beginPath();
    const sway = Math.sin(t * 7 + p) * 0.8;
    c.moveTo(x + pen.J(0.4), y);
    c.quadraticCurveTo(x + 4 + pen.J(0.8), y - fh * 0.45, x + sway + pen.J(0.6), y - fh);
    c.quadraticCurveTo(x - 4 + pen.J(0.8), y - fh * 0.45, x + pen.J(0.4), y);
    c.stroke();
  }
}

/**
 * The sea and causeway through a window, at night or dawn. `exposure` 0..1 is how
 * much of the causeway stands clear of the water (driven by TRUE time), so a player who
 * looks outside can see whether it is really safe — whatever the clocks say.
 */
export function windowSea(pen, x, y, w, h, t, { dawn = 0, exposure = 0, lantern = 0, lanternX = 0.55, salt = 'sea' } = {}) {
  const c = pen.ctx;
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  pen.begin(`${salt}-sky`);
  pen.fillRect(x, y, w, h, `rgba(40,34,40,${0.55 * (1 - dawn * 0.8)})`);
  if (dawn < 0.9) pen.hatch(x, y, w, h, { gap: 2.6 + dawn * 4, dir: 1, w: 0.5, alpha: 0.75 * (1 - dawn) });
  const sea = y + h * 0.6;
  // Swell lines.
  for (let i = 0; i < 4; i++) {
    const yy = sea + 6 + i * ((h * 0.4) / 4) + Math.sin(t * 0.8 + i) * 1.2;
    pen.line(x, yy, x + w, yy + 1, { w: 0.6, col: dawn > 0.5 ? INK : PAPER_LIGHT, alpha: 0.45, passes: 1 });
  }
  pen.line(x, sea, x + w, sea - 2, { w: 0.9, col: dawn > 0.5 ? INK : PAPER_LIGHT, alpha: 0.7 });
  // The causeway: a line of stones, drowned or standing clear.
  const sx = x + w * 0.08;
  const ex = x + w * 0.92;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const px = sx + ((ex - sx) * i) / (n - 1);
    const py = y + h - 6 - ((y + h - 6 - (sea + 4)) * i) / (n - 1);
    const s = 1 - i / n;
    const covered = exposure < 1 && i / n > exposure;
    if (covered) pen.line(px - 3 * s, py, px + 3 * s, py, { w: 0.6, col: dawn > 0.5 ? INK : PAPER_LIGHT, alpha: 0.35, passes: 1 });
    else {
      pen.fillRect(px - 3 * s, py - 2.5 * s, 6 * s, 3 * s, dawn > 0.5 ? INK : PAPER_LIGHT, 0.8);
    }
  }
  if (lantern > 0) {
    const lx = x + w * (lanternX + 0.02 * Math.sin(t * 0.2));
    const ly = sea + 3 + Math.sin(t * 2.1) * 0.6;
    pen.fillEllipse(lx, ly, 3.2, 3.2, `rgba(242,235,217,${0.9 * lantern})`);
    pen.ellipse(lx, ly, 6, 6, { col: RED, w: 0.8, alpha: 0.6 * lantern });
  }
  if (dawn < 0.6) {
    const R = mulberry32(Math.floor(t * 10) * 13 + 11);
    c.strokeStyle = 'rgba(242,235,217,0.4)';
    c.lineWidth = 0.6;
    c.beginPath();
    for (let i = 0; i < 20; i++) {
      const rx = x + ((i * 37 + t * 160 + R() * 6) % (w + 30)) - 15;
      const ry = y + ((i * 53 + t * 420) % (h + 30)) - 15;
      c.moveTo(rx, ry);
      c.lineTo(rx - 3, ry + 9);
    }
    c.stroke();
  }
  c.restore();
}

/** A shelf with jars/bottles — quick set dressing. */
export function shelf(pen, x, y, w, { salt = 'shelf', items = 5 } = {}) {
  pen.begin(salt);
  pen.line(x, y, x + w, y, { w: 1.4 });
  pen.hatch(x, y, w, 4, { gap: 2, w: 0.5 });
  for (let i = 0; i < items; i++) {
    const bx = x + 6 + (i * (w - 12)) / Math.max(1, items - 1);
    const bh = 10 + ((i * 7) % 9);
    pen.fillRect(bx - 4, y - bh, 8, bh, PAPER_LIGHT, 0.7);
    pen.rect(bx - 4, y - bh, 8, bh, { w: 0.8 });
    pen.line(bx - 2, y - bh, bx - 2, y - bh - 3, { w: 0.8 });
  }
}
