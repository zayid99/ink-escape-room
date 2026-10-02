// Chapter 4 — "Low Water": clues, documents, journal pages and the ending drawings.

import { RED, INK, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';

export const CLUES4 = {
  father_mark: { title: 'M.', text: 'Father’s pencil at the foot of the back stair, on the bricks and on the skirting: “M.” and a small cross. Where they found her.' },
  stair_clocks: { title: 'The stair clocks', text: 'The clock by the cellar door stopped at 3:02. The one on the half-landing at 3:09. The heat stopped them as it climbed — on Lark time.' },
  fire_route: { title: 'The fire, minute by minute', text: 'Flue 2:20 · cellar-door clock 2:22 · Abel runs 2:25 · half-landing 2:29 · curtain and longcase 2:37 (3:17 on the clocks). The candle fell last.' },
  first_page: { title: 'The first page', text: '“MAREN LARK — age 13.” And under it, in red, in a nine-year-old’s fist: “W. LARK, age 9 — you drew my bed wrong.”' },
  i_am_wren: { title: 'Wren', text: 'The red pen. The window bed. The skipped year. The calendar: thirty-one. Abel’s notes. I’m not looking for Wren. I’m Wren.' },
};

export const DOCS4 = {
  first_page: {
    title: '',
    kind: 'journal',
    pages: [
      [
        { meta: 'The first page of the sketchbook. The one I always skip.' },
        { hand: 'MAREN LARK — age 13 — PRIVATE. This sketchbook belongs to me and NOBODY ELSE.' },
        { red: 'W. LARK, age 9 — you drew my bed wrong', rot: -4, size: 1.3 },
        { hand: 'GO AWAY WREN', },
        { red: 'no', rot: 3, align: 'right', size: 1.4 },
        { meta: 'Two hands. A thirteen-year-old’s pencil, and a nine-year-old’s red pen, pressed so hard it has come through to the next page.' },
      ],
    ],
  },
};

export const JOURNAL4 = {
  wren: {
    title: 'Wren',
    date: 'Dawn, 15 November',
    blocks: [
      { red: 'My name is Wren Lark. I am thirty-one. My sister Maren died on the back stair when she was thirteen, bringing our father out of the smoke.', rot: -1 },
      { red: 'The fire began at the boiler. It was in the walls before my candle fell. It was never my candle.', rot: -1.5 },
      { red: 'I lit the boiler four nights ago because I was cold. I have been looking for myself ever since.', rot: -1 },
      { meta: 'In red, all of it. The first page in this book in red from top to bottom.' },
    ],
  },
  night_5: {
    title: 'Night 5',
    date: 'Tonight',
    blocks: [
      { hand: 'Came over on the last ferry. The tide was already turning on the causeway behind me.' },
      { hand: 'Wren isn’t here. Her case is.' },
      { hand: '— M.' },
    ],
  },
};

/** The ending drawing: Wexley House from the causeway, in daylight. And someone at the window. */
export function sketchDaylight(pen, w, h) {
  pen.begin('sk-day-house');
  const base = h - 50;
  // Sea and causeway.
  pen.line(0, base, w, base - 4, { w: 1 });
  for (let i = 0; i < 4; i++) pen.line(0, base + 10 + i * 10, w, base + 8 + i * 10, { w: 0.5, alpha: 0.4, passes: 1 });
  pen.poly([[w * 0.55, h], [w * 0.36, base]], { w: 1 });
  pen.poly([[w * 0.7, h], [w * 0.42, base]], { w: 1 });
  // The house.
  const hx = w * 0.18;
  pen.rect(hx, base - 120, 170, 120, { w: 1.6 });
  pen.poly([[hx - 10, base - 120], [hx + 85, base - 170], [hx + 180, base - 120]], { w: 1.6 });
  pen.rect(hx + 130, base - 190, 16, 40, { w: 1.2 });
  pen.rect(hx + 72, base - 44, 26, 44, { w: 1.2 });
  const windows = [[hx + 20, base - 100], [hx + 120, base - 100], [hx + 20, base - 60], [hx + 120, base - 60]];
  for (const [x, y] of windows) {
    pen.rect(x, y, 30, 26, { w: 1 });
    pen.line(x + 15, y, x + 15, y + 26, { w: 0.6 });
  }
  // The nursery window, top right: a small figure, waving. Drawn in black ink.
  // Nobody drew her.
  const nx = hx + 135;
  const ny = base - 86;
  pen.fillEllipse(nx, ny - 2, 3.2, 3.6, PAPER_LIGHT);
  pen.circle(nx, ny - 2, 3.2, { w: 0.9, col: INK });
  pen.line(nx, ny + 2, nx, ny + 9, { w: 1, col: INK });
  pen.line(nx, ny + 4, nx + 6, ny - 3, { w: 0.9, col: INK });
  // Sun low over the water, and no hatching anywhere.
  pen.circle(w * 0.82, base - 70, 16, { w: 1 });
  pen.text('Gannet Island, morning', 12, h - 10, { size: 14, font: FONT_TYPE, alpha: 0.75 });
  pen.text('W.', w - 40, h - 10, { size: 22, col: RED });
}

/** The loop ending: the same first line, again. */
export function sketchNightFive(pen, w, h) {
  pen.begin('sk-night5');
  for (let i = 0; i < 5; i++) {
    pen.text('Came over on the last ferry. Wren isn’t here.', 14, 30 + i * 30, { size: 17, alpha: 1 - i * 0.15 });
    if (i < 4) pen.line(12, 26 + i * 30, w - 30, 22 + i * 30, { col: RED, w: 1.2 });
  }
  for (let i = 0; i < 5; i++) pen.line(w - 80 + i * 9, h - 40, w - 78 + i * 9, h - 10, { col: RED, w: 2 });
  pen.line(w - 84, h - 18, w - 36, h - 34, { col: RED, w: 2 });
}
