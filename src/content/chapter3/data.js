// Chapter 3 — "Exposure": items, clues, documents and journal pages.

import { RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';

export const ITEMS3 = {
  co_alarm: {
    name: 'CO alarm',
    desc: 'Abel’s carbon-monoxide alarm, alive again with the battery from the study. While I carry it, its reading shows in the corner. It screams near the source.',
    icon(pen) {
      pen.begin('icon-co');
      pen.fillEllipse(36, 36, 22, 22, PAPER_LIGHT);
      pen.circle(36, 36, 22, { w: 1.5 });
      pen.circle(36, 36, 14, { w: 0.8 });
      pen.text('CO', 26, 41, { size: 13, font: FONT_TYPE });
      pen.fillEllipse(50, 24, 3, 3, RED);
    },
  },
  cellar_key: {
    name: 'Cellar key',
    desc: 'A heavy iron key on a loop of string, from Mother’s paper safe. Tag: “CELLAR — E. — keep it from the girls.”',
    icon(pen) {
      pen.begin('icon-ckey');
      pen.circle(20, 36, 9, { w: 2 });
      pen.line(29, 36, 62, 36, { w: 2.6 });
      pen.line(54, 36, 54, 48, { w: 2 });
      pen.line(60, 36, 60, 46, { w: 2 });
      pen.line(12, 30, 6, 14, { w: 0.8 });
    },
  },
};

export const CLUES3 = {
  abels_alarm: { title: 'Abel’s alarm', text: 'The chirping all night was a carbon-monoxide alarm on the glasshouse pipe, with a dying battery. Label: “A.R. — keep this ON.”' },
  co_reading: { title: 'Carbon monoxide', text: 'With a fresh battery it screamed: 190 ppm in the glasshouse, where the boiler pipe runs. Worse nearer the cellar.' },
  canaries: { title: 'The canaries', text: 'Pip and Moth, still in their cage after twenty-two years, dry as paper. Canaries die first. That’s why miners carried them.' },
  feb_photos: { title: 'The last photographs', text: '13 February 2004, the morning before the fire. Maren, 13, drawing. Wren, 9, “correcting” with her red pen. Mother’s writing on the back.' },
  cellar_key: { title: 'The cellar key', text: '“Keep it from the girls.” Mother hid it in the one place nobody would open with the light on.' },
  the_crack: { title: 'The crack', text: 'The flue joint behind the boiler, split and black with soot. The alarm screamed. This is where it comes from — and where it came from in 2004.' },
  shut_down: { title: 'The boiler is off', text: 'Gas off, flame out, pump off, air in. In the order on Father’s tag. The radiators have gone quiet.' },
  inquest: { title: 'The inquest', text: 'Maren Elizabeth Lark, aged 13, died in the fire of 14 February 2004. The fire began at the boiler flue. The candle “played no part”.' },
};

const CHILD = '"Caveat", "Comic Sans MS", cursive';

/** Three contact prints from Clara's last roll. */
function sketchPhotos(pen, w, h) {
  const frames = [
    { x: 14, y: 16, label: 'kitchen table' },
    { x: 136, y: 24, label: 'window' },
    { x: 258, y: 14, label: 'the stair' },
  ];
  frames.forEach((f, i) => {
    pen.begin(`sk-photo-${i}`);
    const fw = 110;
    const fh = 150;
    pen.fillRect(f.x, f.y, fw, fh, '#f6f2ea');
    pen.rect(f.x, f.y, fw, fh, { w: 1.4 });
    pen.rect(f.x + 8, f.y + 8, fw - 16, fh - 40, { w: 0.7 });
    pen.hatch(f.x + 8, f.y + 8, fw - 16, fh - 40, { gap: 5, w: 0.35, alpha: 0.4 });
    // Maren: taller, sketchbook. Wren: smaller, a red pen.
    const mx = f.x + 36;
    const wx = f.x + 72;
    const base = f.y + fh - 34;
    pen.fillEllipse(mx, base - 66, 8, 9, PAPER_LIGHT);
    pen.circle(mx, base - 66, 8, { w: 1 });
    pen.poly([[mx - 8, base - 56], [mx - 12, base], [mx + 12, base], [mx + 8, base - 56]], { closed: true, w: 1 });
    pen.rect(mx + 6, base - 46, 12, 15, { w: 1 });
    pen.fillEllipse(wx, base - 46, 7, 8, PAPER_LIGHT);
    pen.circle(wx, base - 46, 7, { w: 1 });
    pen.poly([[wx - 7, base - 38], [wx - 10, base], [wx + 10, base], [wx + 7, base - 38]], { closed: true, w: 1 });
    pen.line(wx - 8, base - 30, mx + 14, base - 40, { w: 2.2, col: RED });
    pen.text(f.label, f.x + 8, f.y + fh - 12, { size: 11, font: FONT_TYPE, alpha: 0.7 });
  });
  pen.begin('sk-photo-caption');
  pen.text('M. (13) & W. (9) — 13 Feb 04 — Wren “correcting” as usual', 14, h - 8, { size: 15, font: CHILD });
}

export const DOCS3 = {
  alarm_label: {
    title: '',
    kind: 'card',
    pages: [[{ hand: 'A.R. — keep this ON. If it beeps, OUT of the house and ring me.' }, { meta: 'A luggage label tied to the alarm’s bracket.' }]],
  },
  potting_notes: {
    title: 'Glasshouse book',
    kind: 'journal',
    pages: [
      [
        { hand: '*2 Feb 04.* Pip and Moth both off their perches this morning. The ferns have browned overnight too — the ones nearest the hot pipe.' },
        { hand: '*5 Feb 04.* Moved the seedlings away from the pipe. Headache again. Edmund says the glasshouse is “all in my head”. Everything is all in my head this winter.' },
        { meta: 'Mother’s gardening book, swollen with damp.' },
      ],
    ],
  },
  darkroom_card: {
    title: 'Pinned above the trays',
    kind: 'card',
    pages: [
      [
        { hand: 'FILM — in this order, under the red light only, NEVER white light:' },
        { list: ['**Developer** 8 min — it lives in brown glass, it hates the light', '**Stop** 30 sec — the vinegar one', '**Fix** 5 min — “hypo”, the crystals', '**Wash** 10 min — just water'] },
        { hand: 'Never fix before you stop. Never let white light near an open tray. — C.' },
      ],
    ],
  },
  feb_photos: {
    title: 'Mother’s last roll',
    kind: 'photo',
    pages: [
      [
        { sketch: sketchPhotos, w: 380, h: 200, label: 'Three photographs of two girls: a taller one with a sketchbook and a smaller one reaching over with a red pen.' },
        { hand: 'M. (13) & W. (9) — 13 Feb 04 — Maren drawing, Wren “correcting” as usual.' },
        { meta: 'Mother’s pencil on the back of the prints.' },
      ],
    ],
  },
  shutdown_tag: {
    title: 'Brass tag on the gas pipe',
    kind: 'ledger',
    pages: [
      [
        { meta: 'SHUTTING HER DOWN — E.L. — Feb 2004. Scratched into brass with a nail.' },
        { list: ['The gas comes first. Always.', 'Don’t trust the pilot to go out on its own — look at it.', 'Never stop the pump while she’s still alight: the water boils in the jacket and she’ll burst.', 'Air the cellar LAST, when nothing’s burning. A draught on a live flame blows her back at you.'] },
        { red: 'too late', rot: -6 },
      ],
    ],
  },
  inquest: {
    title: 'H.M. Coroner — North Riding',
    kind: 'ledger',
    pages: [
      [
        { meta: 'Inquest touching the death of MAREN ELIZABETH LARK, aged 13 years. Held at Whitby, 2 April 2004.' },
        { p: 'The deceased died at Wexley House, Gannet Island, in the early hours of 14 February 2004, as a result of the inhalation of smoke and fire gases.' },
        { p: 'The fire originated at the flue of the domestic boiler in the cellar at approximately **2:20 a.m.**, where a defective joint had allowed combustion products to escape for some weeks. It spread by way of the rear (service) staircase, which acted as a chimney.' },
      ],
      [
        { p: 'Mr Edmund Lark was found unconscious at the foot of the service stair. His daughter Maren was found beside him, having evidently gone back into the house and attempted to bring him out. Carboxyhaemoglobin levels in Mr Lark were consistent with prolonged exposure to carbon monoxide.' },
        { p: 'The younger daughter, **Wren (aged 9)**, was brought down from the porch roof by Mr Abel Rook of Gannet Ferry, who had seen the fire from the harbour.' },
        { p: 'A candle found on the nursery windowsill **played no part in the ignition** of the fire.' },
      ],
      [
        { p: '**Verdict: accidental death.** The court recommends the boiler be removed from service.' },
        { meta: 'Folded small and kept in a tobacco tin behind the boiler. On the tin, in Father’s hand:' },
        { hand: 'Where it happened. Not for Wren. Not yet.' },
      ],
    ],
  },
};

export const JOURNAL3 = {
  maren: {
    title: 'Maren Elizabeth Lark',
    date: 'Tonight — the cellar steps',
    blocks: [
      { hand: 'Maren Elizabeth Lark. Aged thirteen.' },
      { hand: 'I went to Aunt Hester’s after the fire. My marks stop in 2004 because I went away. I’ve been Maren all my life.' },
      { red: 'Then who went back in for Father?', rot: -3 },
      { red: 'Who’s been writing in your journal, M?', rot: -2 },
    ],
  },
};

