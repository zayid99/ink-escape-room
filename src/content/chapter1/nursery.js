// Chapter 1 · Room 3 — the nursery, padlocked since 2004.
// Puzzle 3 ("From Memory"): find the three things her drawing of the room gets wrong.
// The third needs the dollhouse. Then the wardrobe moves, and the back-stair door is
// waiting with four red marks on it (Twist 1).

import { RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { easeInOut, clamp01 } from '../../core/math.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowNight, doorOpen } from './draw.js';

const W = 820;
const WIN = { x: 470, y: 84, w: 80, h: 92 };
const WARDROBE = { x: 640, y: 70, w: 80, h: 186, slide: 84 };
const HATCH = { x: 652, y: 160, w: 52, h: 96 };

function wardrobeOffset(g) {
  if (!g.flag('wardrobeMoved')) return 0;
  const t0 = g.roomTimers.wardrobeStart;
  if (t0 === undefined) return WARDROBE.slide;
  return WARDROBE.slide * easeInOut(clamp01((g.state.playTime - t0) / 1.4));
}

export const nursery = {
  id: 'nursery',
  title: 'The nursery',
  width: W,
  walkY: 304,
  bounds: { min: 50, max: 790 },
  spawnX: 70,
  darkness: 0.9,
  paperSeed: 41,
  ambience: 'attic',
  wind: () => 0.3,
  hazeTarget: () => 0.26,

  lights() {
    return [
      { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2, r: 110, a: 0.36 },
      { x: 56, y: 190, r: 70, a: 0.18 },
    ];
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    wallpaper(pen, W, 20, 240, { gap: 14, salt: 'nursery-wall' });

    // Sloping ceiling and the fire's scorch climbing toward it.
    pen.begin('nursery-roof');
    const roof = [[0, 0], [W, 0], [W, 64], [520, 20], [0, 20]];
    pen.fillPoly(roof, '#d7ccb2');
    pen.hatchPoly(roof, { gap: 2.6, w: 0.6 });
    pen.line(0, 20, 520, 20, { w: 1.3 });
    pen.line(520, 20, W, 64, { w: 1.5 });
    const scorch = [[440, 22], [600, 30], [640, 70], [610, 120], [560, 80], [520, 60], [470, 70]];
    pen.hatchPoly(scorch, { gap: 2.2, w: 0.7 });
    pen.hatchPoly(scorch, { gap: 3, dir: -1, w: 0.6 });

    skirting(pen, W);
    floorboards(pen, W);

    // Door back to the landing.
    doorOpen(pen, 30, 98, 52, 158, { salt: 'nursery-door', swing: 1 });

    // Maren's bed, by the door.
    pen.begin('nursery-bed-m');
    pen.fillRect(112, 196, 8, 60, PAPER_LIGHT);
    pen.rect(112, 196, 8, 60, { w: 1.3 });
    pen.text('MAREN', 104, 192, { size: 8, font: FONT_TYPE, alpha: 0.8 });
    pen.fillPoly([[120, 220], [234, 220], [236, 238], [120, 238]], PAPER_LIGHT);
    pen.rect(120, 220, 114, 18, { w: 1.2 });
    for (let x = 130; x < 230; x += 14) pen.rect(x, 222, 10, 14, { w: 0.5, alpha: 0.7 });
    pen.line(234, 214, 234, FLOOR, { w: 1.4 });
    pen.crossHatch(120, 238, 114, 18, { gap: 2.4, w: 0.55 });
    // Her drawing pinned above it.
    pen.begin('nursery-drawing');
    pen.fillPoly([[150, 108], [192, 110], [190, 142], [148, 140]], PAPER_LIGHT);
    pen.poly([[150, 108], [192, 110], [190, 142], [148, 140]], { closed: true, w: 0.9 });
    pen.rect(162, 118, 16, 16, { w: 0.9 });
    pen.circle(166, 123, 1.6, { w: 0.6 });
    pen.circle(174, 123, 1.6, { w: 0.6 });
    pen.line(170, 118, 170, 112, { w: 0.6 });

    // Music box on a stool.
    pen.begin('nursery-musicbox');
    pen.rect(262, 232, 30, 4, { w: 1.1 });
    pen.line(266, 236, 264, FLOOR, { w: 1.2 });
    pen.line(288, 236, 290, FLOOR, { w: 1.2 });
    pen.fillRect(264, 216, 26, 16, PAPER_LIGHT);
    pen.rect(264, 216, 26, 16, { w: 1.1 });
    pen.poly([[264, 216], [270, 206], [294, 206], [290, 216]], { w: 1 });
    pen.line(292, 224, 298, 224, { w: 1 });
    pen.line(298, 220, 298, 228, { w: 1 });

    // Dollhouse — Father's model of Wexley House.
    pen.begin('nursery-dollhouse');
    const dx = 322;
    pen.fillRect(dx, 186, 100, 70, PAPER_LIGHT, 0.7);
    pen.poly([[dx - 4, 188], [dx + 50, 156], [dx + 104, 188]], { w: 1.4 });
    pen.rect(dx, 186, 100, 70, { w: 1.3 });
    pen.line(dx, 221, dx + 100, 221, { w: 1 });
    pen.line(dx + 50, 186, dx + 50, 256, { w: 1 });
    pen.crossHatch(dx + 2, 223, 46, 31, { gap: 3, w: 0.45, alpha: 0.6 });
    pen.hatch(dx + 52, 223, 46, 31, { gap: 3, w: 0.45, alpha: 0.5 });
    // Tiny nursery (top right): a tiny wardrobe pushed aside, a tiny painted door.
    pen.rect(dx + 82, 194, 9, 24, { w: 0.8 });
    pen.rect(dx + 70, 204, 8, 14, { w: 0.8, col: RED });
    pen.rect(dx + 56, 206, 9, 12, { w: 0.6 });
    pen.rect(dx + 6, 196, 12, 8, { w: 0.6 });

    // Window bed (Wren's) with its carved headboard.
    pen.begin('nursery-bed-w');
    pen.fillRect(440, 192, 9, 64, PAPER_LIGHT);
    pen.rect(440, 192, 9, 64, { w: 1.3 });
    pen.text('WREN', 434, 188, { size: 8, font: FONT_TYPE, alpha: 0.8 });
    pen.fillPoly([[449, 222], [592, 222], [594, 240], [449, 240]], PAPER_LIGHT);
    pen.rect(449, 222, 143, 18, { w: 1.2 });
    pen.poly([[470, 220], [520, 214], [580, 222]], { w: 0.8 });
    pen.line(592, 216, 592, FLOOR, { w: 1.4 });
    pen.crossHatch(449, 240, 143, 16, { gap: 2.4, w: 0.55 });

    // Window and its burned curtains.
    windowFrame(pen, WIN.x, WIN.y, WIN.w, WIN.h, { salt: 'nursery-window' });
    pen.begin('nursery-curtains');
    for (const side of [-1, 1]) {
      const cx = side < 0 ? WIN.x - 22 : WIN.x + WIN.w + 6;
      const hem = [[cx, 150], [cx + 4, 160], [cx + 9, 152], [cx + 13, 164], [cx + 16, 150]];
      pen.fillPoly([[cx, 74], [cx + 16, 74], ...hem.slice().reverse()], PAPER_LIGHT, 0.8);
      pen.poly([[cx, 74], [cx + 16, 74]], { w: 1 });
      pen.line(cx, 74, cx, 150, { w: 1 });
      pen.line(cx + 16, 74, cx + 16, 150, { w: 1 });
      for (let i = 1; i < 4; i++) pen.line(cx + i * 4, 76, cx + i * 4 + 1, 148, { w: 0.5 });
      pen.poly(hem, { w: 1.2 });
      pen.crossHatch(cx, 128, 16, 26, { gap: 1.8, w: 0.6 });
    }
    pen.line(WIN.x - 26, 72, WIN.x + WIN.w + 26, 72, { w: 1.4 });
    // Candle stub on the sill.
    pen.begin('nursery-stub');
    pen.fillRect(505, 178, 6, 6, PAPER_LIGHT);
    pen.rect(505, 178, 6, 6, { w: 1 });
    pen.poly([[502, 184], [506, 186], [510, 185], [515, 184]], { w: 0.7 });
    pen.line(508, 178, 508, 175, { w: 0.7 });

    // The back-stair door (hidden by the wardrobe until it's moved).
    pen.begin('nursery-hatch');
    pen.fillRect(HATCH.x, HATCH.y, HATCH.w, HATCH.h, PAPER_LIGHT, 0.5);
    pen.rect(HATCH.x, HATCH.y, HATCH.w, HATCH.h, { w: 1.4 });
    pen.rect(HATCH.x + 6, HATCH.y + 8, HATCH.w - 12, HATCH.h - 16, { w: 0.7 });
    pen.circle(HATCH.x + HATCH.w - 9, HATCH.y + 50, 2.4, { w: 1 });
    if (fl.hatchOpen) {
      pen.fillRect(HATCH.x + 2, HATCH.y + 2, HATCH.w - 4, HATCH.h - 2, 'rgba(31,27,26,0.7)');
      pen.crossHatch(HATCH.x + 2, HATCH.y + 2, HATCH.w - 4, HATCH.h - 2, { gap: 2, w: 0.6 });
    }
    pen.begin('nursery-endwall');
    pen.line(W - 18, 60, W - 18, FLOOR, { w: 1.2 });
    pen.hatch(W - 18, 60, 18, FLOOR - 60, { gap: 2.4, w: 0.5 });
  },

  drawDynamic(pen, st, t, f) {
    windowNight(pen, WIN.x, WIN.y, WIN.w, WIN.h, t, { lantern: 0, salt: 'nursery-night' });
    pen.begin('nursery-mullions');
    pen.line(WIN.x + WIN.w / 2, WIN.y, WIN.x + WIN.w / 2, WIN.y + WIN.h, { w: 1.3 });
    pen.line(WIN.x, WIN.y + WIN.h * 0.48, WIN.x + WIN.w, WIN.y + WIN.h * 0.48, { w: 1.3 });

    // Wardrobe — dynamic because it slides.
    const g = f.game;
    const x = WARDROBE.x + wardrobeOffset(g);
    const { y, w, h } = WARDROBE;
    pen.begin('nursery-wardrobe');
    pen.fillRect(x, y, w, h, PAPER_LIGHT);
    pen.rect(x, y, w, h, { w: 1.5 });
    pen.poly([[x - 4, y], [x + w / 2, y - 10], [x + w + 4, y]], { w: 1.2 });
    pen.line(x + w / 2, y + 6, x + w / 2, y + h - 22, { w: 1 });
    pen.rect(x + 6, y + 10, w / 2 - 10, h - 40, { w: 0.7 });
    pen.rect(x + w / 2 + 4, y + 10, w / 2 - 10, h - 40, { w: 0.7 });
    pen.circle(x + w / 2 - 5, y + 96, 2, { w: 0.9 });
    pen.circle(x + w / 2 + 5, y + 96, 2, { w: 0.9 });
    pen.rect(x + 4, y + h - 20, w - 8, 14, { w: 0.9 });
    pen.hatch(x + w - 16, y + 4, 16, h - 4, { gap: 2.4, w: 0.6 });
    pen.hatch(x, y + h - 6, w, 6, { gap: 2, w: 0.5 });
  },

  hotspots: [
    {
      id: 'door',
      label: 'the landing',
      verb: 'Go to',
      x: 28,
      y: 96,
      w: 56,
      h: 160,
      approachX: 60,
      async onInteract(g) {
        await g.goTo('landing', { x: 717, facing: -1 });
      },
    },
    {
      id: 'maren_bed',
      label: 'bed by the door',
      x: 108,
      y: 186,
      w: 128,
      h: 70,
      approachX: 210,
      async onInteract(g) {
        await g.say('MAREN, carved into the headboard. Father did both our names with his pocket knife.');
        await bedDiscrepancy(g);
      },
    },
    {
      id: 'maren_drawing',
      label: 'child’s drawing',
      x: 144,
      y: 104,
      w: 52,
      h: 42,
      approachX: 156,
      async onInteract(g) {
        await g.read('dragon_drawing');
        await g.say('“The dragon under the house.” Mine. I don’t remember drawing it.', '“He breathes when the radiators knock.”');
        g.addClue('dragon');
      },
    },
    {
      id: 'music_box',
      label: 'music box',
      x: 258,
      y: 200,
      w: 42,
      h: 34,
      async onInteract(g) {
        await g.say('Mother’s music box. It played when I came in. Four notes.', 'The key won’t turn. The whole mechanism is rusted solid.', 'It can’t have played.');
        g.addClue('music_box');
      },
    },
    {
      id: 'dollhouse',
      label: 'dollhouse',
      x: 316,
      y: 152,
      w: 112,
      h: 104,
      async onInteract(g) {
        await g.say(
          'Father made this for us. It’s Wexley House — every room, every stair.',
          'Our nursery is the top right. Two little beds. A little window.',
          'And the little wardrobe isn’t against the wall. It’s been pushed aside.',
          'Behind it someone painted a tiny door. In red.',
        );
        g.setFlag('dollhouseSeen');
        g.addClue('dollhouse');
      },
    },
    {
      id: 'curtains',
      label: 'curtains',
      x: WIN.x - 26,
      y: 72,
      w: WIN.w + 52,
      h: 96,
      approachX: WIN.x - 18,
      async onInteract(g) {
        await g.say('Burned. Just the hems, black and stiff as card.');
        const r = g.puzzles.completeStep('nursery_memory', 'curtains');
        if (r.isNew) {
          await g.say('In my drawing they’re whole.', 'I never saw them burn. I was already outside when it happened. Father carried us out.', 'Didn’t he?');
          g.addClue('curtains');
          await afterDiscrepancy(g, r, 'curtains');
        }
      },
    },
    {
      id: 'candle_stub',
      label: 'candle stub',
      x: 498,
      y: 170,
      w: 22,
      h: 20,
      async onInteract(g) {
        await g.say(
          'A candle stub on the sill, melted into a puddle.',
          'Wren’s candle. She lit it every night for the tall man.',
          'This is the one that fell. The curtain caught. That’s how it started.',
          'She was nine. She has never forgiven herself.',
        );
        g.addClue('candle_stub');
      },
    },
    {
      id: 'wren_bed',
      label: 'bed under the window',
      x: 436,
      y: 184,
      w: 160,
      h: 72,
      approachX: 562,
      async onInteract(g) {
        await g.say('The headboard by the window. Carved into it: WREN.');
        await bedDiscrepancy(g);
      },
    },
    {
      id: 'wardrobe',
      label: 'wardrobe',
      verb: (st) => (st.flags['nursery_memory.complete'] && !st.flags.wardrobeMoved ? 'Push' : 'Inspect'),
      x: WARDROBE.x,
      y: WARDROBE.y - 10,
      w: WARDROBE.w,
      h: WARDROBE.h + 10,
      approachX: WARDROBE.x - 18,
      enabled: (st) => !st.flags.wardrobeMoved,
      async onInteract(g) {
        if (g.flag('nursery_memory.complete')) {
          await g.say('I put my shoulder to it.');
          g.sfx('scrape');
          g.roomTimers.wardrobeStart = g.state.playTime;
          g.setFlag('wardrobeMoved');
          g.shake = 0.15;
          await g.wait(1500);
          await g.say('There. Exactly where I drew it.', 'A little door. And something written on it.');
          g.annotate('nursery', { id: 'tally', type: 'tally', x: HATCH.x + 12, y: HATCH.y + 14, h: 18, count: 4 }, { instant: true });
          g.annotate('nursery', { id: 'pocket', type: 'text', text: 'Maren — check', x: HATCH.x + 2, y: HATCH.y + 52, size: 13, rot: -0.06 }, { instant: true });
          g.annotate('nursery', { id: 'pocket2', type: 'text', text: 'your coat pocket.', x: HATCH.x - 2, y: HATCH.y + 66, size: 13, rot: -0.04 }, { instant: true });
          g.objective('Look at the little door.');
          return;
        }
        if (!g.flag('dollhouseSeen')) {
          await g.say('Mother’s old wardrobe. Far too heavy to shift.', 'In my drawing there’s a little door here, and no wardrobe at all.', 'I must have imagined it.');
          return;
        }
        await g.say('In the dollhouse, this wardrobe stands aside. And in my drawing there’s a door right here.');
        const r = g.puzzles.completeStep('nursery_memory', 'wardrobe');
        if (r.isNew) await afterDiscrepancy(g, r, 'wardrobe');
      },
    },
    {
      id: 'hatch',
      label: (st) => (st.flags.ch1Twist ? 'the back stair' : 'little door'),
      verb: (st) => (st.flags.ch1Twist ? 'Go down' : 'Inspect'),
      x: HATCH.x,
      y: HATCH.y,
      w: HATCH.w,
      h: HATCH.h,
      enabled: (st) => !!st.flags.wardrobeMoved,
      async onInteract(g) {
        if (g.flag('ch1Twist')) {
          await g.chapterEnd();
          return;
        }
        await twist(g);
      },
    },
  ],

  async onEnter(g, from) {
    if (from === 'landing' && !g.flag('nurseryEntered')) {
      g.setFlag('nurseryEntered');
      await g.wait(600);
      g.sfx('musicbox', { notes: [1047, 988, 784, 659], gap: 0.6, volume: 0.8 });
      g.audio.pulseTension(0.5, 3000);
      await g.wait(2600);
      await g.say('…The music box.', 'Our room. Nobody has been in here for twenty-two years.', 'I drew this room in my journal once, from memory, so I’d know it again.');
      g.addEntry('nursery_memory', { silent: true });
      await g.read('nursery_memory');
      await g.say('Something’s wrong with it. Or with the room.');
      g.objective('Compare the nursery with my drawing of it (J). Find what doesn’t match.');
    }
  },
};

async function bedDiscrepancy(g) {
  const r = g.puzzles.completeStep('nursery_memory', 'bed');
  if (!r.isNew) return;
  await g.say(
    'Wait. In my drawing I labelled the window bed “M — mine”.',
    'But the window bed says WREN. Mine is the one by the door.',
    'I always had the window. I’m sure I always had the window.',
    'I must be remembering it backwards.',
  );
  g.addClue('headboard');
  await afterDiscrepancy(g, r, 'bed');
}

const CORRECTION_MARKS = {
  bed: { id: 'fix-bed', type: 'circle', x: 430, y: 180, w: 32, h: 20 },
  curtains: { id: 'fix-curtain', type: 'text', text: 'burned', x: WIN.x + WIN.w + 26, y: 168, size: 16, rot: 0.1 },
  wardrobe: { id: 'fix-wardrobe', type: 'arrow', x: 600, y: 120, x2: 644, y2: 150 },
};

/** A discrepancy was found: mark the room in red, and redraw the page once all three are in. */
async function afterDiscrepancy(g, r, step) {
  g.annotate('nursery', CORRECTION_MARKS[step]);
  if (!r.complete) {
    g.ui.toast(`Corrected the drawing (${r.done} of ${r.total})`, { red: true });
    return;
  }
  g.setFlag('nursery_memory.complete');
  g.sfx('solve');
  g.audio.pulseTension(0.6, 3000);
  await g.say('That’s three. The drawing is wrong about the beds, wrong about the curtains…', 'And right about the door.');
  await g.read('nursery_memory');
  g.objective('Move the wardrobe.');
}

/** Twist 1: the red notes are hers. */
async function twist(g) {
  g.audio.setTension(0.4);
  await g.say('The back-stair door.', 'Four marks, in red. And my name.', g.red('Maren — check your coat pocket.'), 'My pocket.');
  g.sfx('paper');
  await g.wait(500);
  g.give('red_pen', { silent: true });
  g.sfx('heartbeat');
  await g.say(
    'A red fineliner. The cap is chewed flat.',
    'It’s the one missing from Wren’s box.',
    'Wren chews her pens. She always has.',
    'I don’t.',
  );
  g.addClue('tally', { silent: true });
  g.addClue('red_pen');
  g.sfx('heartbeat');
  await g.say(
    'Four marks. Four nights.',
    '“Don’t trust the clocks. Don’t trust me either.” “3:17 again?” “Not real.”',
    'They’re not Wren’s notes.',
    'They’re mine.',
  );
  g.audio.pulseTension(1, 5000);
  g.sfx('page');
  await g.say('At the back of the journal, three pages are stuck together. I peel them apart.');
  g.addEntry('night_1', { silent: true });
  g.addEntry('night_2', { silent: true });
  g.addEntry('night_3', { silent: true });
  await g.openJournal('night_1');
  await g.say(
    'The same entry. Night after night. In my handwriting.',
    'I’ve been here four nights, not one. And I don’t remember any of it.',
    'Whatever this house is doing to me, it did to Wren first.',
    'The back stair goes down into the dark. If she’s anywhere, she’s down there.',
  );
  g.setFlag('ch1Twist');
  g.sfx('door', { volume: 0.5 });
  g.setFlag('hatchOpen');
  g.objective('Go down the back stair.');
  g.audio.setTension(0.15);
}

