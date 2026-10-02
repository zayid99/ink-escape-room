// The back stair, walked properly for the first time: from the kitchen up to the
// nursery, the way the fire went. Two clocks the heat stopped on the way.
// Chapter 4 puzzle 1: reconstruct the night by TRUE time.

import { RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { floorboards, doorOpen, clockFace } from '../draw.js';

const W = 760;

export const backstair = {
  id: 'backstair',
  title: 'The back stair',
  width: W,
  walkY: 304,
  bounds: { min: 50, max: 724 },
  spawnX: 60,
  darkness: 0.85,
  paperSeed: 103,
  ambience: 'attic',
  wind: () => 0.3,
  hazeTarget: () => 0.15,
  coLevel: () => 8,

  lights() {
    return [
      { x: 60, y: 190, r: 90, a: 0.3 },
      { x: 700, y: 110, r: 120, a: 0.4 },
    ];
  },

  drawStatic(pen, st) {
    pen.begin('bs-walls');
    pen.line(0, 20, W, 20, { w: 1.4 });
    // The stair climbs from bottom-left to top-right.
    for (let i = 0; i < 14; i++) {
      const x = 90 + i * 40;
      const y = 240 - i * 13;
      pen.line(x, y, x + 40, y, { w: 1.2 });
      pen.line(x + 40, y, x + 40, y - 13, { w: 1 });
    }
    pen.line(90, 250, 650, 58, { w: 1.6 });
    pen.line(90, 200, 650, 10, { w: 1.2 });
    // Fire damage: the stair-well hatched black, thickest at the bottom.
    pen.hatchPoly([[90, 250], [650, 58], [650, 0], [90, 0]], { gap: 2.2, w: 0.6, alpha: 0.85 });
    pen.hatchPoly([[90, 250], [380, 150], [380, 0], [90, 0]], { gap: 2.6, dir: -1, w: 0.6 });
    // Charred banister posts.
    for (let i = 0; i < 7; i++) pen.line(120 + i * 80, 240 - i * 26, 120 + i * 80, 190 - i * 26, { w: 2.2 });
    floorboards(pen, W);
    doorOpen(pen, 26, 98, 48, 158, { salt: 'bs-kitchen', swing: 1 });
    pen.text('kitchen', 28, 92, { size: 9, font: FONT_TYPE, col: PAPER_LIGHT, alpha: 0.8 });
    // Father's mark at the foot.
    pen.begin('bs-mark');
    pen.text('M.', 96, 236, { size: 11, font: FONT_TYPE, col: PAPER_LIGHT });
    pen.line(112, 228, 118, 236, { w: 0.8, col: PAPER_LIGHT });
    pen.line(118, 228, 112, 236, { w: 0.8, col: PAPER_LIGHT });

    // Clock 1: fallen by the cellar door, 3:02.
    pen.begin('bs-clock1');
    pen.fillEllipse(170, 250, 15, 15, PAPER_LIGHT);
    clockFace(pen, 170, 250, 13, 3, 2, { w: 0.9 });
    pen.text('by the cellar door', 140, 278, { size: 9, font: FONT_TYPE, alpha: 0.7 });
    // Clock 2: on the half-landing wall, 3:09.
    pen.begin('bs-clock2');
    pen.fillEllipse(400, 120, 18, 18, PAPER_LIGHT);
    clockFace(pen, 400, 120, 16, 3, 9, { w: 1 });
    pen.text('half-landing', 372, 152, { size: 9, font: FONT_TYPE, col: PAPER_LIGHT, alpha: 0.8 });

    // The little door at the top: the nursery.
    pen.begin('bs-top');
    pen.rect(668, 60, 50, 96, { w: 1.4 });
    pen.fillRect(672, 64, 42, 88, PAPER_LIGHT, 0.4);
    pen.text('nursery', 670, 54, { size: 9, font: FONT_TYPE, col: PAPER_LIGHT, alpha: 0.8 });
    if (st.solved.fire_route) {
      pen.begin('bs-route');
      pen.line(170, 236, 400, 140, { col: RED, w: 1.2, alpha: 0.8 });
      pen.line(400, 140, 690, 90, { col: RED, w: 1.2, alpha: 0.8 });
    }
  },

  hotspots: [
    {
      id: 'kitchen',
      label: 'the kitchen',
      verb: 'Go down to',
      x: 24,
      y: 96,
      w: 52,
      h: 160,
      approachX: 56,
      async onInteract(g) {
        await g.goTo('kitchen', { x: 60, facing: 1 });
      },
    },
    {
      id: 'mark',
      label: 'pencil mark',
      x: 90,
      y: 222,
      w: 36,
      h: 20,
      async onInteract(g) {
        await g.say('“M.” and a little cross, in Father’s pencil, on the bottom step.', 'This is where they found her. Beside him. She had dragged him this far.');
        g.addClue('father_mark');
      },
    },
    {
      id: 'clock1',
      label: 'fallen clock',
      x: 150,
      y: 232,
      w: 40,
      h: 36,
      async onInteract(g) {
        await g.say('A little clock that hung by the cellar door, face-down on the step. Its hands: 3:02.', 'The heat stopped it. Lark time.');
        g.addClue('stair_clocks');
      },
    },
    {
      id: 'clock2',
      label: 'half-landing clock',
      x: 378,
      y: 98,
      w: 44,
      h: 44,
      approachX: 400,
      async onInteract(g) {
        await g.say('The half-landing clock, blistered. 3:09.', 'Then the longcase on the landing: 3:17.', 'Each one stopped as the fire climbed past it.');
        g.addClue('stair_clocks');
        if (!g.puzzles.isSolved('fire_route')) await reconstruct(g);
      },
    },
    {
      id: 'route',
      label: 'the night of the fire',
      verb: 'Piece together',
      x: 250,
      y: 150,
      w: 110,
      h: 70,
      approachX: 300,
      enabled: (st) => !st.solved.fire_route,
      async onInteract(g) {
        await reconstruct(g);
      },
    },
    {
      id: 'top',
      label: 'the nursery',
      verb: 'Go up to',
      x: 664,
      y: 56,
      w: 58,
      h: 200,
      approachX: 700,
      async onInteract(g) {
        if (!g.puzzles.isSolved('fire_route')) {
          await g.say('Not yet.', 'I need to know what happened on this stair. Minute by minute.');
          return;
        }
        await g.goTo('nursery', { x: 678, facing: -1 });
      },
    },
  ],

  async onEnter(g) {
    if (!g.flag('backstairSeen')) {
      g.setFlag('backstairSeen');
      await g.say('I’ve run up and down these stairs four nights without seeing them.', 'Black. All the way up. Father painted over nothing.');
      g.objective('Reconstruct the night of the fire — in TRUE time.');
    }
  },
};

async function reconstruct(g) {
  const ok = await g.puzzles.openOrder('fire_route');
  if (!ok) return;
  g.addClue('fire_route');
  g.audio.pulseTension(0.8, 4000);
  await g.say(
    'The flue caught at twenty past two. The fire was in the cellar, then the stair, then the half-landing.',
    'Abel saw the glow at twenty-five past and ran.',
    'And at 2:37 — 3:17 on Father’s clocks — the heat reached the landing and the nursery curtain caught.',
    'The same minute her candle fell.',
    'The fire was in the walls seventeen minutes before the candle fell. The candle didn’t start anything.',
    'It was never Wren’s candle.',
  );
  g.objective('Go up to the nursery.');
}

export const FIRE_ROUTE_PUZZLE = {
  kind: 'order',
  title: 'The night of 14 February 2004',
  intro: 'Put what happened in order, by the **true** time. The house clocks ran forty minutes fast. Abel’s watch didn’t.',
  slotLabels: ['first', 'then', 'then', 'then', 'last'],
  cards: [
    { id: 'curtain', label: 'The nursery curtain catches', detail: 'the landing longcase stops at 3:17' },
    { id: 'abel', label: 'Abel sees the glow and runs', detail: '“twenty-five past two by my watch”' },
    { id: 'half', label: 'The half-landing clock stops', detail: 'its hands: 3:09' },
    { id: 'flue', label: 'The boiler flue catches', detail: 'the inquest: about 2:20 a.m.' },
    { id: 'cellar', label: 'The cellar-door clock stops', detail: 'its hands: 3:02' },
  ],
  solution: ['flue', 'cellar', 'abel', 'half', 'curtain'],
  solvedText: '2:20 · 2:22 · 2:25 · 2:29 · 2:37.',
  onWrong(order) {
    if (order[0] !== 'flue') return { message: 'Nothing burned before the flue.', red: 'Where did it START?' };
    if (order.indexOf('abel') > order.indexOf('half')) return { message: 'Not quite. Turn every clock into true time first.', red: 'House clocks: subtract forty. Abel’s watch: true.' };
    return { message: 'Not quite.', red: 'Lark time or true time?' };
  },
};
