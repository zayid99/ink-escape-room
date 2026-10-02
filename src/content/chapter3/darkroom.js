// Mother's darkroom under the stairs. Pitch black until her red safelight is on — and
// white light ruins everything, so the torch must be off (F).
// Chapter 3 puzzle 2: develop her last roll of film in the right order.
// The cellar key is in her light-tight paper safe.

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { FLOOR, floorboards, skirting, doorOpen, shelf } from '../draw.js';

const W = 720;
const LAMP = { x: 150, y: 60 };

export const darkroom = {
  id: 'darkroom',
  title: 'The darkroom',
  width: W,
  walkY: 304,
  bounds: { min: 46, max: 690 },
  spawnX: 60,
  darkness: 0.96,
  paperSeed: 91,
  ambience: 'attic',
  wind: () => 0.1,
  hazeTarget: () => 0.4,
  coLevel: () => 85,

  lights(st) {
    const L = [{ x: 56, y: 190, r: 70, a: 0.25 }];
    if (st.flags.safelight) L.push({ x: LAMP.x + 200, y: 160, r: 380, a: 0.62, core: 0.4 });
    return L;
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    pen.begin('dr-walls');
    pen.line(0, 24, W, 24, { w: 1.4 });
    pen.hatch(0, 0, W, 24, { gap: 2.6, w: 0.5 });
    // Blackout cloth over everything.
    for (let x = 10; x < W; x += 30) pen.line(x, 24, x + 6, 200, { w: 0.5, alpha: 0.5, passes: 1 });
    skirting(pen, W, 240);
    floorboards(pen, W);
    doorOpen(pen, 24, 98, 48, 158, { salt: 'dr-door', swing: 1 });
    pen.text('hall', 36, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Safelight and its pull-switch.
    pen.begin('dr-lamp');
    pen.line(LAMP.x, 24, LAMP.x, LAMP.y - 10, { w: 1 });
    pen.poly([[LAMP.x - 14, LAMP.y - 10], [LAMP.x + 14, LAMP.y - 10], [LAMP.x + 10, LAMP.y + 10], [LAMP.x - 10, LAMP.y + 10]], { closed: true, w: 1.2 });
    pen.line(LAMP.x + 14, LAMP.y, LAMP.x + 14, LAMP.y + 70, { w: 0.6 });
    pen.circle(LAMP.x + 14, LAMP.y + 74, 3, { w: 0.9 });

    // Enlarger.
    pen.begin('dr-enlarger');
    pen.rect(196, 190, 70, 10, { w: 1.2 });
    pen.line(250, 190, 250, 70, { w: 1.6 });
    pen.rect(214, 90, 40, 30, { w: 1.2 });
    pen.poly([[222, 120], [246, 120], [240, 140], [228, 140]], { closed: true, w: 1 });
    // Bench and film canister.
    pen.fillRect(180, 200, 120, 6, PAPER_LIGHT);
    pen.rect(180, 200, 120, 6, { w: 1.3 });
    pen.line(186, 206, 186, FLOOR, { w: 1.4 });
    pen.line(294, 206, 294, FLOOR, { w: 1.4 });
    if (!fl.filmDeveloped) {
      pen.rect(280, 184, 12, 16, { w: 1 });
      pen.line(280, 188, 292, 188, { w: 0.6 });
    }

    // Sink with four trays.
    pen.begin('dr-sink');
    pen.rect(330, 196, 210, 60, { w: 1.4 });
    pen.crossHatch(332, 214, 206, 40, { gap: 3, w: 0.45, alpha: 0.6 });
    for (let i = 0; i < 4; i++) {
      const x = 338 + i * 50;
      pen.poly([[x, 196], [x + 42, 196], [x + 38, 186], [x + 4, 186]], { closed: true, w: 1 });
      pen.text(String(i + 1), x + 18, 182, { size: 9, font: FONT_TYPE, alpha: 0.8 });
    }
    // The process card.
    pen.fillPoly([[400, 90], [460, 92], [459, 150], [399, 148]], PAPER_LIGHT);
    pen.poly([[400, 90], [460, 92], [459, 150], [399, 148]], { closed: true, w: 1 });
    for (let i = 0; i < 5; i++) pen.line(404, 102 + i * 9, 454, 103 + i * 9, { w: 0.5, passes: 1 });

    // Chemical shelf: brown bottle, clear bottle, jar of crystals, jug.
    shelf(pen, 556, 150, 110, { salt: 'dr-shelf', items: 4 });
    pen.begin('dr-bottles');
    pen.fillRect(560, 128, 10, 22, INK, 0.7);

    // Paper safe: a light-tight drawer cabinet.
    pen.begin('dr-safe');
    pen.rect(572, 196, 96, 60, { w: 1.4 });
    pen.rect(580, 206, 80, 18, { w: 1 });
    pen.rect(580, 230, 80, 18, { w: 1 });
    pen.text('PAPER — NO LIGHT', 582, 218, { size: 6, font: FONT_TYPE });
    // Prints drying on a line, once developed.
    if (fl.filmDeveloped) {
      pen.begin('dr-prints');
      pen.line(290, 30, 560, 32, { w: 0.6 });
      for (let i = 0; i < 3; i++) {
        pen.fillRect(300 + i * 34, 33, 28, 38, PAPER_LIGHT);
        pen.rect(300 + i * 34, 33, 28, 38, { w: 1 });
        pen.line(308 + i * 34, 64, 314 + i * 34, 46, { w: 1.6, col: RED });
      }
    }
  },

  drawLit(pen, st) {
    if (st.flags.safelight) {
      pen.begin('dr-safelight');
      pen.fillEllipse(LAMP.x, LAMP.y + 2, 9, 6, RED);
    }
  },

  hotspots: [
    {
      id: 'door',
      label: 'the hall',
      verb: 'Go to',
      x: 22,
      y: 96,
      w: 52,
      h: 160,
      approachX: 52,
      async onInteract(g) {
        await g.goTo('hall', { x: 878, facing: -1 });
      },
    },
    {
      id: 'safelight',
      label: 'light pull',
      verb: (st) => (st.flags.safelight ? 'Switch off' : 'Pull'),
      x: LAMP.x - 16,
      y: LAMP.y - 16,
      w: 40,
      h: 96,
      approachX: LAMP.x + 10,
      async onInteract(g) {
        g.sfx('click');
        g.setFlag('safelight', !g.flag('safelight'));
        if (g.flag('safelight')) await g.say('Mother’s safelight. Everything turns the colour of the inside of an eyelid.');
      },
    },
    {
      id: 'card',
      label: 'card on the wall',
      verb: 'Read',
      x: 396,
      y: 86,
      w: 68,
      h: 68,
      async onInteract(g) {
        await g.read('darkroom_card');
      },
    },
    {
      id: 'canister',
      label: 'film canister',
      x: 274,
      y: 178,
      w: 24,
      h: 24,
      priority: true,
      enabled: (st) => !st.flags.filmDeveloped,
      async onInteract(g) {
        await g.say('A roll of film, still in its canister. Her label: “FEB 04 — girls — 24 exp.”', 'She never developed it. She left in 2005.');
        g.objective('Develop Mother’s film: safelight on, torch OFF (F), then the trays.');
      },
    },
    {
      id: 'trays',
      label: 'developing trays',
      verb: 'Use',
      x: 330,
      y: 176,
      w: 214,
      h: 80,
      approachX: 436,
      async onInteract(g) {
        if (g.flag('filmDeveloped')) {
          await g.read('feb_photos');
          return;
        }
        if (!g.flag('safelight')) {
          await g.say('I can’t see a thing in here. Mother worked under a red safelight — the pull is by the door.');
          return;
        }
        if (g.flashlight.on) {
          await g.say('Not with the torch on. White light on open film and there’d be nothing left of it.', g.red('Torch off — F.'));
          return;
        }
        await g.say('Four trays and four bottles. Brown glass, clear glass, a jar of crystals, a jug of water.', 'Her card is pinned above them.');
        const ok = await g.puzzles.openOrder('develop_film');
        if (!ok) return;
        g.setFlag('filmDeveloped');
        g.sfx('page');
        await g.say('Eight minutes in the dark. Then shapes come up in the trays like faces through water.');
        await g.read('feb_photos');
        g.addClue('feb_photos');
        await g.say(
          'The morning before the fire. Mother must have taken these at breakfast.',
          'Maren with her sketchbook. Thirteen. That’s me.',
          'And Wren, nine, leaning over with her red pen, “correcting”.',
          'She always held the pen in her fist like that. I still… she still does.',
        );
        g.objective(g.has('cellar_key') ? 'Open the cellar.' : 'Find the cellar key. Mother kept things where light couldn’t get at them.');
      },
    },
    {
      id: 'safe',
      label: 'paper safe',
      verb: 'Open',
      x: 568,
      y: 192,
      w: 104,
      h: 64,
      enabled: (st) => !st.flags.cellarKeyFound,
      async onInteract(g) {
        if (g.flashlight.on) {
          await g.say('PAPER — NO LIGHT. Open it with the torch on and I’d spoil whatever’s inside.', g.red('Torch off — F.'));
          return;
        }
        g.setFlag('cellarKeyFound');
        g.give('cellar_key');
        g.addClue('cellar_key');
        await g.say('In the dark I feel inside. Paper, paper — and something heavy on a loop of string.', 'A key. The tag says CELLAR — E. — keep it from the girls.');
        g.objective(g.flag('filmDeveloped') ? 'Open the cellar (the hall).' : 'Open the cellar (the hall). Mother’s film is still undeveloped.');
      },
    },
    {
      id: 'shelf',
      label: 'chemicals',
      x: 552,
      y: 116,
      w: 120,
      h: 40,
      async onInteract(g) {
        await g.say('Brown glass, marked D-76. A clear bottle that smells sharply of vinegar. A jar of dissolved crystals, “hypo”. A jug of water.');
      },
    },
  ],
};

export const DEVELOP_PUZZLE = {
  kind: 'order',
  title: 'Developing the film',
  intro: 'Pour into the four trays, in order. Mother’s card is above the sink.',
  slotLabels: ['Tray 1', 'Tray 2', 'Tray 3', 'Tray 4'],
  cards: [
    { id: 'water', label: 'The jug', detail: 'plain tap water' },
    { id: 'hypo', label: 'The jar of crystals', detail: 'labelled “hypo”' },
    { id: 'brown', label: 'The brown bottle', detail: 'D-76; it hates the light' },
    { id: 'vinegar', label: 'The clear bottle', detail: 'smells of vinegar' },
  ],
  solution: ['brown', 'vinegar', 'hypo', 'water'],
  solvedText: 'Developer, stop, fix, wash.',
  onWrong(order) {
    if (order.indexOf('hypo') < order.indexOf('vinegar')) return { message: 'The film fogs grey at the edges. I rinse it and start again.', red: 'Never fix before you stop.' };
    if (order[0] !== 'brown') return { message: 'Nothing comes up. The first tray has to make the picture appear.' };
    return { message: 'Not like that. Read her card again.' };
  },
};
