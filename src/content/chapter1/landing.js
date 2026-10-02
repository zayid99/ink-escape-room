// Chapter 1 · Room 2 — the landing. Father's clocks, the family photo, the nursery
// padlock (Puzzle 2, "The True Minute") and the first sighting of the tall man.

import { INK, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowNight, doorClosed, doorOpen, clockFace } from '../draw.js';

const W = 1040;
const WIN = { x: 140, y: 80, w: 70, h: 100 };
const ARCH = { x: 860, y: 90, w: 92, h: 166 };
const PHANTOM_X = ARCH.x + ARCH.w / 2;

export const landing = {
  id: 'landing',
  title: 'The landing',
  width: W,
  walkY: 304,
  bounds: { min: 40, max: 1000 },
  spawnX: 70,
  darkness: 0.88,
  paperSeed: 23,
  ambience: 'attic',
  wind: () => 0.35,
  hazeTarget: () => 0.32,

  lights(st) {
    return [
      { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2, r: 95, a: 0.32 },
      // Spill of candlelight from the attic room behind the open door.
      { x: 66, y: 190, r: 90, a: 0.3 },
      ...(st.solved.nursery_padlock ? [{ x: 717, y: 180, r: 60, a: 0.12 }] : []),
    ];
  },

  drawStatic(pen, st) {
    wallpaper(pen, W, 30, 200, { gap: 18, salt: 'landing-wall' });
    pen.begin('landing-rails');
    pen.line(0, 30, W, 30, { w: 1.4 });
    pen.hatch(0, 0, W, 30, { gap: 2.8, w: 0.5, alpha: 0.85 });
    pen.line(0, 70, W, 70, { w: 0.8, alpha: 0.8 });
    pen.line(0, 200, W, 200, { w: 1 });
    // Wainscot panels.
    for (let x = 10; x < W - 40; x += 64) pen.rect(x, 208, 52, 26, { w: 0.6, alpha: 0.7 });
    skirting(pen, W, 240);
    floorboards(pen, W);
    // A runner carpet down the middle of the floor.
    pen.begin('landing-runner');
    pen.line(0, 280, W, 280, { w: 0.9 });
    pen.line(0, 322, W, 322, { w: 0.9 });
    for (let x = 20; x < W; x += 40) pen.ellipse(x, 301, 6, 3, { w: 0.5, alpha: 0.5, steps: 10 });

    // Study door (open).
    doorOpen(pen, 40, 98, 52, 158, { salt: 'landing-studydoor', swing: 1 });

    windowFrame(pen, WIN.x, WIN.y, WIN.w, WIN.h, { salt: 'landing-window' });

    // Longcase clock, stopped at 3:17.
    pen.begin('landing-longcase');
    pen.fillRect(270, 58, 48, 198, PAPER_LIGHT, 0.6);
    pen.poly([[266, 58], [294, 46], [322, 58]], { w: 1.4 });
    pen.rect(268, 58, 52, 54, { w: 1.4 });
    clockFace(pen, 294, 85, 18, 3, 17, { w: 1.1 });
    pen.rect(276, 112, 36, 108, { w: 1.3 });
    pen.rect(284, 128, 20, 70, { w: 0.9 });
    pen.line(294, 128, 294, 184, { w: 0.8 });
    pen.circle(294, 188, 6, { w: 1 });
    pen.hatch(276, 112, 8, 108, { gap: 2.2, w: 0.5 });
    pen.rect(270, 220, 48, 36, { w: 1.4 });
    pen.hatch(270, 220, 48, 36, { gap: 3, w: 0.5, alpha: 0.6 });

    // Family photograph in a frame.
    pen.begin('landing-photo');
    pen.fillRect(354, 102, 58, 44, PAPER_LIGHT);
    pen.rect(352, 100, 62, 48, { w: 1.6 });
    pen.rect(358, 106, 50, 36, { w: 0.7 });
    for (const [x, hgt] of [[368, 24], [378, 22], [389, 17], [398, 12]]) pen.line(x, 138, x, 138 - hgt, { w: 2 });
    pen.scribble(395, 124, 6, 5, { w: 0.9, density: 8 });
    pen.line(383, 100, 383, 88, { w: 0.6 });
    pen.fillEllipse(383, 87, 1.5, 1.5, INK);

    // Side table with the ledger and an unlit oil lamp.
    pen.begin('landing-table');
    pen.fillRect(440, 206, 72, 5, PAPER_LIGHT);
    pen.rect(440, 206, 72, 5, { w: 1.3 });
    pen.line(446, 211, 444, FLOOR, { w: 1.4 });
    pen.line(506, 211, 508, FLOOR, { w: 1.4 });
    pen.crossHatch(446, 216, 60, 40, { gap: 3, w: 0.45, alpha: 0.6 });
    pen.fillRect(450, 198, 40, 8, PAPER_LIGHT);
    pen.rect(450, 198, 40, 8, { w: 1.1 });
    pen.line(452, 202, 488, 202, { w: 0.5 });
    pen.ellipse(500, 202, 6, 4, { w: 1 });
    pen.ellipse(500, 188, 4, 9, { w: 0.9 });

    // Radiator — warm.
    pen.begin('landing-radiator');
    pen.rect(556, 206, 70, 42, { w: 1.3 });
    for (let i = 1; i < 7; i++) pen.line(556 + i * 10, 208, 556 + i * 10, 246, { w: 0.8 });
    pen.line(560, 248, 560, FLOOR, { w: 1 });
    pen.line(622, 248, 622, FLOOR, { w: 1 });
    pen.line(626, 214, 640, 214, { w: 1.2 });
    pen.line(640, 214, 640, FLOOR, { w: 1.2 });

    // Nursery door with Father's padlock and the height marks on its frame.
    if (st.solved.nursery_padlock) doorOpen(pen, 690, 98, 54, 158, { salt: 'landing-nursery', swing: -1 });
    else {
      doorClosed(pen, 690, 98, 54, 158, { salt: 'landing-nursery', knobSide: 1 });
      pen.begin('landing-padlock');
      pen.rect(726, 164, 16, 6, { w: 1.1 });
      pen.ellipse(738, 176, 6, 7, { w: 1.2, frac: 0.6 });
      pen.fillRect(732, 176, 12, 14, PAPER_LIGHT);
      pen.rect(732, 176, 12, 14, { w: 1.2 });
      pen.line(740, 190, 742, 200, { w: 0.5 });
      pen.poly([[738, 200], [748, 199], [749, 210], [739, 211]], { closed: true, w: 0.7 });
    }
    pen.begin('landing-heights');
    for (let i = 0; i < 9; i++) pen.line(748, 130 + i * 13, 756, 130 + i * 13, { w: 0.6, alpha: 0.8 });

    // Stair arch: dark, hatched, a gate across it with a new brass padlock.
    pen.begin('landing-arch');
    pen.line(ARCH.x - 6, FLOOR, ARCH.x - 6, ARCH.y + 20, { w: 1.6 });
    pen.line(ARCH.x + ARCH.w + 6, FLOOR, ARCH.x + ARCH.w + 6, ARCH.y + 20, { w: 1.6 });
    pen.ellipse(ARCH.x + ARCH.w / 2, ARCH.y + 22, ARCH.w / 2 + 6, 26, { w: 1.6, frac: 0.5, overshoot: 0 });
    pen.fillRect(ARCH.x, ARCH.y + 10, ARCH.w, ARCH.h - 10, 'rgba(31,27,26,0.6)');
    pen.crossHatch(ARCH.x, ARCH.y + 6, ARCH.w, ARCH.h - 6, { gap: 2, w: 0.65 });
    // Stairs going down into the dark.
    for (let i = 0; i < 5; i++) pen.line(ARCH.x + 6, 210 + i * 10, ARCH.x + ARCH.w - 6, 214 + i * 10, { w: 0.6, col: PAPER_LIGHT, alpha: 0.25 });
    // End wall.
    pen.begin('landing-end');
    pen.line(W - 20, 30, W - 20, FLOOR, { w: 1.2 });
    pen.hatch(W - 20, 30, 20, FLOOR - 30, { gap: 2.4, w: 0.5 });
    pen.text('E.L.', 302, 252, { size: 7, font: FONT_TYPE, alpha: 0.7 });
  },

  /** The gate is drawn in front of the stair arch so the tall man stands behind its bars. */
  drawMid(pen) {
    pen.begin('landing-gate');
    pen.line(ARCH.x - 4, 168, ARCH.x + ARCH.w + 4, 168, { w: 1.8 });
    pen.line(ARCH.x - 4, 250, ARCH.x + ARCH.w + 4, 250, { w: 1.8 });
    for (let x = ARCH.x + 4; x < ARCH.x + ARCH.w; x += 11) pen.line(x, 168, x, 250, { w: 1.4 });
    pen.fillRect(ARCH.x + ARCH.w / 2 - 7, 192, 14, 15, PAPER_LIGHT);
    pen.rect(ARCH.x + ARCH.w / 2 - 7, 192, 14, 15, { w: 1.2 });
    pen.ellipse(ARCH.x + ARCH.w / 2, 191, 5, 6, { w: 1.1, frac: 0.55 });
    pen.line(ARCH.x + ARCH.w / 2 - 4, 196, ARCH.x + ARCH.w / 2 + 4, 196, { w: 0.6, col: PAPER_LIGHT });
  },

  drawDynamic(pen, st, t) {
    windowNight(pen, WIN.x, WIN.y, WIN.w, WIN.h, t, { lantern: 1, salt: 'landing-night' });
    pen.begin('landing-mullions');
    pen.line(WIN.x + WIN.w / 2, WIN.y, WIN.x + WIN.w / 2, WIN.y + WIN.h, { w: 1.3 });
    pen.line(WIN.x, WIN.y + WIN.h * 0.48, WIN.x + WIN.w, WIN.y + WIN.h * 0.48, { w: 1.3 });
    // Heat shimmer above the radiator.
    const c = pen.ctx;
    c.strokeStyle = 'rgba(31,27,26,0.18)';
    c.lineWidth = 0.6;
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const x = 566 + i * 16;
      c.moveTo(x, 202);
      c.bezierCurveTo(x + Math.sin(t * 2 + i) * 4, 190, x - Math.sin(t * 2.3 + i) * 4, 180, x + Math.sin(t * 1.7 + i) * 3, 168);
    }
    c.stroke();
  },

  hotspots: [
    {
      id: 'study_door',
      label: 'the attic room',
      verb: 'Go to',
      x: 38,
      y: 96,
      w: 56,
      h: 160,
      approachX: 66,
      async onInteract(g) {
        await g.goTo('study', { x: 712, facing: -1 });
      },
    },
    {
      id: 'window',
      label: 'window',
      x: WIN.x - 6,
      y: WIN.y - 6,
      w: WIN.w + 12,
      h: WIN.h + 12,
      async onInteract(g) {
        await g.say('Rain. The causeway’s gone under.', g.flag('sawLantern') ? 'The lantern’s still out there, halfway to the mainland. It isn’t moving now.' : 'There’s a light out on the water. A lantern.');
        g.setFlag('sawLantern');
      },
    },
    {
      id: 'longcase',
      label: 'longcase clock',
      x: 266,
      y: 46,
      w: 56,
      h: 210,
      async onInteract(g) {
        await g.say('Father’s longcase clock. Stopped at 3:17, like the one in the attic room.', 'After the fire he stopped every clock in the house. He never said why.');
        g.addClue('longcase');
        if (g.story.hasClue('lark_time')) {
          await g.say('But if it was kept forty minutes fast… then the minute it shows isn’t the minute it really stopped.');
        }
      },
    },
    {
      id: 'photo',
      label: 'photograph',
      x: 350,
      y: 86,
      w: 66,
      h: 64,
      async onInteract(g) {
        await g.read('family_photo');
        await g.say(
          'The four of us on the causeway. The summer before the fire.',
          'Somebody has scribbled out the little one’s face. Hard — right through the picture.',
          'Wren went through a phase of hating photographs of herself.',
          'And that’s me with the sketchbook. I was never without it.',
        );
        g.addClue('family_photo');
      },
    },
    {
      id: 'ledger',
      label: 'ledger',
      verb: 'Read',
      x: 446,
      y: 190,
      w: 50,
      h: 18,
      priority: true,
      async onInteract(g) {
        await g.read('clock_ledger');
        await g.say('Lark time. I’d forgotten. Every clock in the house forty minutes fast, so nobody would misjudge the tide.', 'Except the regulator in his workshop. That one kept the truth.');
        g.addClue('lark_time');
        g.setFlag('ledgerRead');
      },
    },
    {
      id: 'radiator',
      label: 'radiator',
      x: 552,
      y: 200,
      w: 78,
      h: 54,
      async onInteract(g) {
        await g.say('It’s warm.', 'Father never used the heating. He said the boiler was “unwell” and kept the cellar locked.', 'Somebody has it running.');
        g.addClue('radiator');
      },
    },
    {
      id: 'nursery_door',
      label: (st) => (st.solved.nursery_padlock ? 'the nursery' : 'nursery door'),
      verb: (st) => (st.solved.nursery_padlock ? 'Go to' : 'Inspect'),
      x: 688,
      y: 96,
      w: 58,
      h: 160,
      approachX: 717,
      async onInteract(g) {
        if (g.puzzles.isSolved('nursery_padlock')) {
          await g.goTo('nursery', { x: 70, facing: 1 });
          return;
        }
        if (!g.flag('padlockSeen')) {
          g.setFlag('padlockSeen');
          await g.say('Our old room. The nursery.', 'Father put a padlock on it the week after the fire. Nobody has opened it since.', 'There’s a tag on the hasp, in his writing.');
          g.addClue('padlock_tag');
          g.objective('Open Father’s padlock on the nursery door.');
        }
        const solved = await g.puzzles.openCodeLock('nursery_padlock');
        if (solved) {
          await g.say('The shackle drops open.', 'Twenty-two years.');
          g.objective('Look around the nursery.');
          await g.goTo('nursery', { x: 70, facing: 1 });
        }
      },
    },
    {
      id: 'heights',
      label: 'pencil marks',
      x: 744,
      y: 120,
      w: 18,
      h: 130,
      approachX: 740,
      async onInteract(g) {
        await g.read('height_marks');
        await g.say(
          'Our heights, in Father’s pencil. M on one side, W on the other.',
          'Mine stop in 2004. Of course they do — I went to Aunt Hester’s in Leeds after the fire.',
          'Wren’s carry on. Except… there’s no mark for 2005.',
        );
        g.addClue('height_marks');
      },
    },
    {
      id: 'stairs',
      label: 'stairs down',
      x: ARCH.x - 6,
      y: ARCH.y,
      w: ARCH.w + 12,
      h: ARCH.h,
      async onInteract(g) {
        g.sfx('locked');
        await g.say('The stairs down. There’s a gate across them — and a padlock.', 'A new one. Bright brass, not a speck of rust. That isn’t Father’s.');
        g.addClue('new_padlock');
        if (!g.puzzles.isSolved('nursery_padlock')) {
          await g.say('There was another way down once. The back stair, from our old room.', 'Father boarded it up. Or I think he did.');
          g.objective('Open Father’s padlock on the nursery door.');
        }
      },
    },
  ],

  async onEnter(g, from) {
    if (from === 'study' && !g.flag('landingSeen')) {
      g.setFlag('landingSeen');
      await g.say('The landing. Everything where it always was.', 'It’s warmer out here than it should be.');
      g.objective('Find a way downstairs.');
    }
  },

  /** The tall man appears in the stair arch after the radiator knocks — once he has a reason to. */
  onUpdate(g, dt) {
    const timers = g.roomTimers;
    const ready = (g.flag('ledgerRead') || g.flag('padlockSeen')) && !g.flag('tallManSeen');
    if (!ready || g.phantom.active || g.busy || g.ui.blocking()) return;
    timers.landingKnock = (timers.landingKnock || 0) + dt;
    if (timers.landingKnock < 5) return;
    timers.landingKnock = -25; // if he isn't caught, the house tries again later
    g.sfx('knock', { pan: 0.2 });
    g.phantom.summon({
      x: PHANTOM_X,
      footY: FLOOR,
      height: 150,
      delay: 1.4,
      linger: 6,
      onCaught: () => {
        g.scare({ shake: 0.5 });
        g.setFlag('tallManSeen');
        g.annotate('landing', { id: 'not-real', type: 'text', text: 'not real.', x: ARCH.x + 6, y: ARCH.y + 70, size: 22, rot: -0.12 });
        g.annotate('landing', { id: 'not-real-line', type: 'underline', x: ARCH.x + 6, y: ARCH.y + 76, w: 70 });
        g.ambient(async () => {
          await g.wait(900);
          await g.say('There was something—', 'In the arch. Tall. Standing very still.', 'There’s nothing there. There’s nothing there.');
          g.addClue('tall_man_seen');
        });
      },
    });
  },
};

