// Item registry. Each item has a procedural ink icon (72×72) and optional
// examine behaviour, linked document, and combinations.

import { RED, INK, PAPER_LIGHT, FONT_TYPE } from '../render/ink.js';

export const ITEMS = {
  tide_table: {
    name: 'Tide table',
    desc: 'Gannet Island causeway, November. Father’s pencil in the margins. Thin, flat card.',
    doc: 'tide_table',
    icon(pen) {
      pen.begin('icon-tide');
      pen.fillPoly([[14, 10], [58, 13], [56, 62], [12, 59]], PAPER_LIGHT);
      pen.poly([[14, 10], [58, 13], [56, 62], [12, 59]], { closed: true, w: 1.2 });
      for (let i = 0; i < 6; i++) pen.line(18, 22 + i * 6.5, 52, 24 + i * 6.5, { w: 0.7, passes: 1 });
      pen.circle(24, 28, 5, { col: RED, w: 1.1 });
    },
    combine: {
      ferry_ticket: async (g) => {
        await g.say(
          'The ticket says the 10th of November.',
          'On the tide table, the 10th is circled. In red.',
          'If Wren came over on the 10th… that was four days ago. What has she been doing for four days?',
        );
        g.addClue('four_days');
      },
    },
  },
  hairpin: {
    name: 'Hairpin',
    desc: 'One of Wren’s. Thin, black, bent from use. Long enough to reach through a keyhole.',
    icon(pen) {
      pen.begin('icon-pin');
      pen.line(16, 56, 54, 14, { w: 2 });
      pen.line(20, 58, 56, 18, { w: 2 });
      pen.line(54, 14, 56, 18, { w: 2 });
    },
  },
  study_key: {
    name: 'Iron key',
    desc: 'The key to the attic room. It was in the lock — on the wrong side.',
    icon(pen) {
      pen.begin('icon-key');
      pen.circle(22, 36, 10, { w: 2 });
      pen.line(32, 36, 60, 36, { w: 2.4 });
      pen.line(52, 36, 52, 46, { w: 2 });
      pen.line(58, 36, 58, 44, { w: 2 });
    },
  },
  battery: {
    name: '9-volt battery',
    desc: 'From the smoke alarm, I suppose. It was wrapped in paper: [[SHUT UP SHUT UP SHUT UP]].',
    icon(pen) {
      pen.begin('icon-batt');
      pen.fillPoly([[22, 18], [50, 18], [50, 60], [22, 60]], PAPER_LIGHT);
      pen.rect(22, 18, 28, 42, { w: 1.4 });
      pen.rect(27, 11, 6, 7, { w: 1.2 });
      pen.rect(39, 11, 6, 7, { w: 1.2 });
      pen.hatch(22, 40, 28, 20, { gap: 2.5, w: 0.7 });
      pen.text('9V', 27, 34, { size: 12, font: FONT_TYPE });
    },
  },
  matchbook: {
    name: 'Matchbook',
    desc: '“GANNET FERRY CO. — Rook & Son.” Folded double. It was wedging the window open. Four matches left.',
    examine: async (g) => {
      await g.say('“Rook & Son.” The ferry company.', 'Somebody folded this to wedge the window open. Somebody who wanted the room cold.');
      g.addClue('rook_matches');
    },
    icon(pen) {
      pen.begin('icon-match');
      pen.fillPoly([[16, 22], [56, 22], [56, 52], [16, 52]], PAPER_LIGHT);
      pen.rect(16, 22, 40, 30, { w: 1.4 });
      pen.line(16, 34, 56, 34, { w: 1 });
      pen.text('ROOK', 22, 47, { size: 11, font: FONT_TYPE });
      for (let i = 0; i < 4; i++) pen.line(22 + i * 6, 22, 22 + i * 6, 12, { w: 1.6, col: i === 3 ? RED : INK });
    },
  },
  ferry_ticket: {
    name: 'Ferry ticket',
    desc: 'A single crossing to Gannet Island. Dated the 10th of November.',
    doc: 'ferry_ticket',
    icon(pen) {
      pen.begin('icon-ticket');
      pen.fillPoly([[10, 24], [62, 20], [64, 48], [12, 52]], PAPER_LIGHT);
      pen.poly([[10, 24], [62, 20], [64, 48], [12, 52]], { closed: true, w: 1.2 });
      pen.text('SINGLE', 18, 38, { size: 10, font: FONT_TYPE, rot: -0.07 });
      pen.line(46, 22, 48, 50, { w: 0.8 });
    },
    combine: {
      tide_table: (g) => ITEMS.tide_table.combine.ferry_ticket(g),
    },
  },
  red_pen: {
    name: 'Red fineliner',
    desc: 'From my coat pocket. The cap is chewed flat. [[Wren chews her pens.]]',
    examine: async (g) => {
      await g.say('The cap is chewed flat, bitten all the way round.', 'Wren chews her pens. She always has.', 'I don’t.');
    },
    icon(pen) {
      pen.begin('icon-redpen');
      pen.line(14, 58, 52, 16, { w: 5, col: RED });
      pen.line(52, 16, 58, 10, { w: 2, col: INK });
      pen.scribble(12, 52, 10, 10, { col: INK, w: 0.8, density: 6 });
    },
  },
};

