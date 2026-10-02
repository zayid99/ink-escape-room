// Ink drawings that live inside documents and journal pages. Each is (pen, w, h).

import { RED, INK, PAPER_LIGHT, FONT_HAND, FONT_TYPE } from '../render/ink.js';

const CHILD = '"Caveat", "Comic Sans MS", cursive';

/** A tall thin shape in a doorway — the gap in the ink. */
function tallFigure(pen, x, foot, h, { col = INK, gap = true } = {}) {
  const c = pen.ctx;
  if (gap) {
    c.fillStyle = PAPER_LIGHT;
    c.beginPath();
    c.arc(x, foot - h + 7, 7, 0, Math.PI * 2);
    c.moveTo(x - 9, foot - h + 18);
    c.lineTo(x + 9, foot - h + 18);
    c.lineTo(x + 7, foot);
    c.lineTo(x - 7, foot);
    c.closePath();
    c.fill();
  }
  pen.circle(x, foot - h + 7, 7, { col, w: 1 });
  pen.poly([[x - 9, foot - h + 18], [x - 7, foot], [x + 7, foot], [x + 9, foot - h + 18]], { col, w: 1 });
}

export function sketchTallManDoorway(pen, w, h) {
  pen.begin('sk-tm');
  // Doorway, hatched dark, with the figure as a hole.
  const dx = w * 0.34;
  pen.rect(dx, 30, 90, h - 50, { w: 1.6 });
  pen.crossHatch(dx + 4, 34, 82, h - 58, { gap: 3.2, w: 0.7 });
  tallFigure(pen, dx + 45, h - 24, 130);
  // Radiator.
  const rx = w * 0.68;
  pen.rect(rx, h - 70, 70, 46, { w: 1.3 });
  for (let i = 1; i < 7; i++) pen.line(rx + i * 10, h - 66, rx + i * 10, h - 28, { w: 0.8 });
  pen.text('knock knock knock', rx - 6, h - 80, { size: 15, font: CHILD, rot: -0.08 });
  // Child's candle.
  pen.line(w * 0.14, h - 30, w * 0.14, h - 52, { w: 3 });
  pen.text('Wren’s candle', w * 0.04, h - 8, { size: 15, font: CHILD });
  pen.ellipse(w * 0.14, h - 60, 4, 8, { col: RED, w: 1.2 });
  pen.line(0, h - 24, w, h - 24, { w: 1 });
}

export function sketchCrumpled(pen, w, h) {
  const spots = [
    [70, 70, 0.9, -0.2],
    [190, 64, 1.1, 0.12],
    [300, 76, 0.8, -0.05],
    [120, 170, 1, 0.08],
    [250, 172, 1.2, -0.14],
  ];
  spots.forEach(([x, y, s, r], i) => {
    pen.begin(`sk-crumple-${i}`);
    const c = pen.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(r);
    c.scale(s, s);
    pen.poly([[-44, -46], [40, -50], [46, 40], [-40, 46]], { closed: true, w: 0.8, alpha: 0.6 });
    pen.line(-30, -10, 34, 18, { w: 0.5, alpha: 0.4 });
    pen.line(-20, 30, 10, -40, { w: 0.5, alpha: 0.4 });
    pen.rect(-14, -38, 28, 76, { w: 0.9 });
    pen.hatch(-12, -36, 24, 72, { gap: 2.6, w: 0.5 });
    tallFigure(pen, 0, 36, 64);
    pen.cross(-30, -34, 60, 70, { w: 2 });
    c.restore();
  });
}

export function sketchFamilyPhoto(pen, w, h) {
  pen.begin('sk-photo');
  const c = pen.ctx;
  // Photo border.
  pen.fillRect(10, 10, w - 20, h - 20, PAPER_LIGHT);
  pen.rect(10, 10, w - 20, h - 20, { w: 1.6 });
  pen.rect(22, 22, w - 44, h - 64, { w: 0.8 });
  // Sea and causeway.
  pen.line(22, 96, w - 22, 92, { w: 0.8 });
  pen.hatch(22, 22, w - 44, 70, { gap: 5, w: 0.4, alpha: 0.5 });
  pen.poly([[40, h - 42], [w * 0.45, 100], [w * 0.55, 100], [w - 40, h - 42]], { w: 0.9 });
  // Four figures: Father, Mother, Maren (taller girl), Wren (small).
  const base = h - 50;
  const fig = (x, ht, r) => {
    const body = [[x - r * 0.9, base - ht + r + 2], [x - r * 1.3, base], [x + r * 1.3, base], [x + r * 0.9, base - ht + r + 2]];
    pen.fillEllipse(x, base - ht, r, r * 1.1, PAPER_LIGHT);
    pen.fillPoly(body, PAPER_LIGHT);
    pen.circle(x, base - ht, r, { w: 1.1 });
    pen.poly(body, { closed: true, w: 1.1 });
    pen.hatch(x - r * 1.3, base - ht + r + 2, r * 2.6, ht - r - 2, { gap: 2.4, w: 0.5, alpha: 0.6 });
  };
  fig(w * 0.25, 92, 11);
  fig(w * 0.42, 84, 10);
  fig(w * 0.6, 66, 9); // the taller girl, holding a sketchbook
  pen.rect(w * 0.6 + 8, base - 50, 12, 15, { w: 1 });
  fig(w * 0.74, 48, 8); // the small girl
  // Her face, scribbled out in black, hard enough to dent the paper.
  pen.scribble(w * 0.74 - 9, base - 56, 18, 16, { w: 1.6, density: 14 });
  pen.scribble(w * 0.74 - 8, base - 57, 16, 18, { w: 1.2, density: 10 });
  c.save();
  pen.text('Gannet causeway, Aug 2003', 26, h - 18, { size: 13, font: FONT_TYPE, alpha: 0.75 });
  c.restore();
}

export function sketchHeightMarks(pen, w, h) {
  pen.begin('sk-heights');
  const fx = w * 0.5;
  pen.line(fx - 30, 6, fx - 30, h - 6, { w: 2.4 });
  pen.line(fx + 30, 6, fx + 30, h - 6, { w: 2.4 });
  pen.hatch(fx - 30, 6, 60, h - 12, { gap: 7, w: 0.3, alpha: 0.3 });
  const marks = [
    ['M 2000', 150],
    ['M 2001', 130],
    ['M 2002', 110],
    ['M 2003', 92],
    ['M Jan 2004', 80],
  ];
  const wren = [
    ['W 2000', 228],
    ['W 2001', 214],
    ['W 2002', 200],
    ['W 2003', 186],
    ['W 2004', 172],
    ['W 2006', 146],
    ['W 2007', 134],
    ['W 2008', 122],
    ['W 2010', 104],
    ['W 2012', 86],
  ];
  const sy = (v) => (v / 240) * (h - 20) + 10;
  for (const [label, y] of marks) {
    pen.line(fx - 30, sy(y), fx - 6, sy(y), { w: 1.1 });
    pen.text(label, fx - 36, sy(y) + 4, { size: 13, font: FONT_HAND, align: 'right' });
  }
  for (const [label, y] of wren) {
    pen.line(fx + 6, sy(y), fx + 30, sy(y), { w: 1.1 });
    pen.text(label, fx + 36, sy(y) + 4, { size: 13, font: FONT_HAND });
  }
}

export function sketchDragon(pen, w, h) {
  pen.begin('sk-dragon');
  // A child's drawing of the boiler as a dragon.
  pen.rect(w * 0.32, 60, 110, 120, { w: 2 });
  pen.circle(w * 0.32 + 30, 95, 10, { w: 1.6 });
  pen.circle(w * 0.32 + 80, 95, 10, { w: 1.6 });
  pen.fillEllipse(w * 0.32 + 30, 95, 4, 4, INK);
  pen.fillEllipse(w * 0.32 + 80, 95, 4, 4, INK);
  pen.poly([[w * 0.32 + 25, 140], [w * 0.32 + 40, 128], [w * 0.32 + 55, 142], [w * 0.32 + 70, 128], [w * 0.32 + 85, 140]], { w: 1.6 });
  // Pipes up to the house, breath curling out.
  pen.line(w * 0.32 + 55, 60, w * 0.32 + 55, 18, { w: 2 });
  pen.line(w * 0.32 + 55, 18, w - 30, 18, { w: 2 });
  for (let i = 0; i < 3; i++) pen.ellipse(w * 0.2 - i * 18, 110 - i * 22, 12 + i * 4, 8 + i * 3, { w: 1, frac: 0.8 });
  pen.text('the dragon under the house', 16, h - 34, { size: 18, font: CHILD });
  pen.text('— M. age 12', w - 120, h - 12, { size: 15, font: CHILD });
}

/**
 * "The nursery, from memory" — drawn by the protagonist. Red corrections appear as
 * she finds what's wrong: flags nursery_memory.bed / .curtains / .wardrobe.
 */
export function sketchNurseryMemory(state) {
  const f = state.flags;
  return (pen, w, h) => {
    pen.begin('sk-nursery');
    const floor = h - 34;
    pen.line(8, floor, w - 8, floor, { w: 1.3 });
    pen.line(8, 14, w - 8, 14, { w: 0.8, alpha: 0.6 });
    // Window + curtains (whole, in the memory).
    const wx = w * 0.42;
    pen.rect(wx, 40, 64, 70, { w: 1.4 });
    pen.line(wx + 32, 40, wx + 32, 110, { w: 0.8 });
    pen.hatch(wx + 2, 42, 60, 66, { gap: 3, w: 0.5, alpha: 0.7 });
    for (const side of [-1, 1]) {
      const cx = side < 0 ? wx - 14 : wx + 64;
      pen.poly([[cx, 34], [cx + 14, 34], [cx + 12, 124], [cx + 2, 126]], { closed: true, w: 1 });
      for (let i = 1; i < 4; i++) pen.line(cx + i * 3.5, 36, cx + i * 3.2, 122, { w: 0.5 });
    }
    // Window bed, labelled as hers.
    pen.rect(wx - 10, floor - 30, 92, 18, { w: 1.2 });
    pen.line(wx - 10, floor - 12, wx - 10, floor, { w: 1.2 });
    pen.line(wx + 82, floor - 12, wx + 82, floor, { w: 1.2 });
    pen.text('M (mine)', wx + 10, floor - 36, { size: 17 });
    // Inner bed.
    pen.rect(30, floor - 30, 92, 18, { w: 1.2 });
    pen.line(30, floor - 12, 30, floor, { w: 1.2 });
    pen.line(122, floor - 12, 122, floor, { w: 1.2 });
    pen.text('W', 70, floor - 36, { size: 17 });
    // The little door on the right wall — no wardrobe in the memory.
    const dx = w - 86;
    pen.rect(dx, floor - 70, 44, 70, { w: 1.3 });
    pen.circle(dx + 36, floor - 34, 2.2, { w: 1 });
    pen.text('back stair', dx - 4, floor - 78, { size: 15 });

    // ---- red corrections ----
    if (f['nursery_memory.bed']) {
      pen.line(wx + 6, floor - 42, wx + 62, floor - 46, { col: RED, w: 1.8 });
      pen.text('W', wx + 66, floor - 38, { size: 22, col: RED, rot: -0.1 });
      pen.circle(76, floor - 42, 12, { col: RED, w: 1.3 });
      pen.text('M?', 92, floor - 44, { size: 18, col: RED });
    }
    if (f['nursery_memory.curtains']) {
      for (const side of [-1, 1]) {
        const cx = side < 0 ? wx - 14 : wx + 64;
        pen.scribble(cx, 96, 14, 30, { col: RED, w: 1.2, density: 8 });
      }
      pen.text('burned', wx - 12, 142, { size: 16, col: RED, rot: 0.05 });
    }
    if (f['nursery_memory.wardrobe']) {
      pen.rect(dx - 14, floor - 120, 72, 120, { col: RED, w: 1.4 });
      pen.line(dx + 22, floor - 120, dx + 22, floor, { col: RED, w: 1 });
      pen.arrow(dx - 30, floor - 60, dx - 6, floor - 30, { col: RED });
      pen.text('behind!', dx - 78, floor - 64, { size: 17, col: RED, rot: -0.08 });
    }
  };
}
