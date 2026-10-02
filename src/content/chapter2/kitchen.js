// The kitchen, at the foot of the back stair. Somebody was here tonight.
// Chapter 2 puzzle 1 ("The Tape"): splice the snapped answerphone cassette and play it.

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { vnoise } from '../../core/math.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowSea, doorClosed, doorOpen, flame, shelf } from '../draw.js';
import { drawWallClock } from './data.js';
import { houseMinutes, trueMinutes, fmt, causewayExposure } from '../time.js';

const W = 900;
const WIN = { x: 360, y: 72, w: 80, h: 88 };
const CLOCK = { x: 566, y: 92, r: 20 };

export const kitchen = {
  id: 'kitchen',
  title: 'The kitchen',
  width: W,
  walkY: 304,
  bounds: { min: 46, max: 868 },
  spawnX: 64,
  darkness: 0.82,
  paperSeed: 57,
  ambience: 'attic',
  wind: () => 0.35,
  hazeTarget: () => 0.38,
  coLevel: (x) => 70 + 30 * Math.exp(-(((x - 790) / 80) ** 2)),

  lights(st, t, f) {
    const p = f.settings.get('reduceFlicker') ? 0.95 : 0.85 + 0.15 * vnoise(t * 3);
    return [
      { x: 180, y: 200, r: 150 * p, a: 0.55 },
      { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2, r: 90, a: 0.3 },
    ];
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    wallpaper(pen, W, 26, 196, { gap: 20, salt: 'kit-wall' });
    pen.begin('kit-tiles');
    pen.line(0, 26, W, 26, { w: 1.4 });
    pen.hatch(0, 0, W, 26, { gap: 2.6, w: 0.5 });
    // Tiled splashback band.
    pen.line(0, 196, W, 196, { w: 1 });
    for (let x = 0; x < W; x += 18) pen.line(x, 196, x, 240, { w: 0.4, alpha: 0.5, passes: 1 });
    pen.line(0, 218, W, 218, { w: 0.4, alpha: 0.5, passes: 1 });
    skirting(pen, W, 240);
    floorboards(pen, W);

    // Back stair door (open, dark).
    doorOpen(pen, 30, 98, 50, 158, { salt: 'kit-backstair', swing: 1 });
    pen.text('back stair', 30, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // The range.
    pen.begin('kit-range');
    pen.fillRect(110, 150, 140, 106, PAPER_LIGHT, 0.8);
    pen.rect(110, 150, 140, 106, { w: 1.6 });
    pen.rect(122, 170, 50, 36, { w: 1 });
    pen.rect(188, 170, 50, 36, { w: 1 });
    pen.rect(122, 214, 50, 34, { w: 1 });
    pen.rect(188, 214, 50, 34, { w: 1 });
    pen.hatch(122, 214, 50, 34, { gap: 2, w: 0.6 });
    pen.line(110, 158, 250, 158, { w: 1 });
    pen.ellipse(150, 146, 18, 4, { w: 1 });
    pen.ellipse(210, 146, 18, 4, { w: 1 });
    // Kettle.
    pen.fillEllipse(212, 132, 14, 12, PAPER_LIGHT);
    pen.ellipse(212, 132, 14, 12, { w: 1.2 });
    pen.line(226, 128, 236, 120, { w: 1.4 });
    pen.ellipse(212, 118, 8, 4, { w: 1, frac: 0.6 });
    // Flue pipe up to the ceiling.
    pen.rect(170, 26, 16, 120, { w: 1 });
    pen.hatch(170, 26, 16, 120, { gap: 3, w: 0.4, alpha: 0.6 });

    // Table with a mug and the phone.
    pen.begin('kit-table');
    pen.fillRect(266, 212, 84, 5, PAPER_LIGHT);
    pen.rect(266, 212, 84, 5, { w: 1.3 });
    pen.line(272, 217, 270, FLOOR, { w: 1.4 });
    pen.line(344, 217, 346, FLOOR, { w: 1.4 });
    pen.fillRect(282, 198, 14, 14, PAPER_LIGHT);
    pen.rect(282, 198, 14, 14, { w: 1 });
    pen.ellipse(299, 205, 4, 4, { w: 0.9, frac: 0.6 });
    pen.fillRect(314, 206, 20, 6, INK);
    pen.line(316, 207, 330, 207, { w: 0.4, col: PAPER_LIGHT });

    // Window over the sink.
    windowFrame(pen, WIN.x, WIN.y, WIN.w, WIN.h, { salt: 'kit-window' });
    // Answerphone on the side unit.
    pen.begin('kit-phone');
    pen.rect(356, 214, 88, 42, { w: 1.3 });
    pen.hatch(356, 214, 88, 42, { gap: 3.2, w: 0.4, alpha: 0.5 });
    pen.fillRect(366, 196, 52, 18, PAPER_LIGHT);
    pen.rect(366, 196, 52, 18, { w: 1.1 });
    pen.rect(372, 200, 22, 10, { w: 0.8 });
    pen.fillEllipse(410, 204, 2, 2, fl.tapeHeard ? INK : RED);
    pen.ellipse(428, 202, 9, 5, { w: 1 });
    if (!fl.cassetteTaken) pen.line(396, 210, 404, 216, { w: 0.8 });

    // Dresser: drawers below, bread crock on top, plates on the rack.
    pen.begin('kit-dresser');
    pen.rect(446, 196, 70, 60, { w: 1.4 });
    pen.rect(452, 214, 58, 16, { w: 1 });
    pen.circle(481, 222, 1.8, { w: 1 });
    pen.rect(452, 234, 58, 18, { w: 1 });
    pen.line(446, 196, 446, 110, { w: 1.2 });
    pen.line(516, 196, 516, 110, { w: 1.2 });
    pen.line(446, 110, 516, 110, { w: 1.2 });
    for (let i = 0; i < 4; i++) pen.circle(456 + i * 16, 130, 7, { w: 0.9 });
    pen.line(446, 140, 516, 140, { w: 1 });
    pen.fillRect(458, 172, 34, 24, PAPER_LIGHT);
    pen.rect(458, 172, 34, 24, { w: 1.1 });
    pen.ellipse(475, 171, 17, 3, { w: 1 });
    pen.text('BREAD', 461, 188, { size: 7, font: FONT_TYPE, alpha: 0.8 });

    // Calendar.
    pen.begin('kit-cal');
    pen.fillPoly([[604, 120], [640, 122], [639, 168], [603, 166]], PAPER_LIGHT);
    pen.poly([[604, 120], [640, 122], [639, 168], [603, 166]], { closed: true, w: 1 });
    for (let i = 0; i < 4; i++) pen.line(608, 136 + i * 7, 636, 137 + i * 7, { w: 0.4, passes: 1 });
    pen.circle(618, 150, 3, { col: RED, w: 0.8 });

    // Back door, bolted.
    doorClosed(pen, 662, 98, 54, 158, { salt: 'kit-backdoor', knobSide: -1 });
    pen.begin('kit-bolt');
    pen.rect(668, 140, 22, 6, { w: 1.2 });
    pen.rect(668, 200, 22, 6, { w: 1.2 });

    // Glasshouse door (glazed).
    pen.begin('kit-glassdoor');
    pen.rect(756, 98, 58, 158, { w: 1.5 });
    for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 2; c2++) pen.rect(762 + c2 * 25, 104 + r * 28, 21, 24, { w: 0.7 });
    pen.hatch(762, 104, 46, 110, { gap: 3, w: 0.4, alpha: fl.greenhouseOpen ? 0.2 : 0.5 });
    pen.text('glasshouse', 760, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });
    shelf(pen, 600, 60, 46, { salt: 'kit-shelf', items: 3 });

    // Door to the hall.
    doorOpen(pen, 846, 98, 50, 158, { salt: 'kit-halldoor', swing: -1 });
    pen.text('hall', 860, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Wet boot prints from the back door to the stove, and back.
    pen.begin('kit-prints');
    for (let i = 0; i < 9; i++) {
      const x = 680 - i * 52;
      const y = 280 + (i % 2) * 14;
      pen.fillEllipse(x, y, 7, 3, 'rgba(31,27,26,0.55)');
    }
  },

  drawDynamic(pen, st, t) {
    windowSea(pen, WIN.x, WIN.y, WIN.w, WIN.h, t, {
      dawn: st.chapter === 4 ? 0.7 : 0,
      exposure: causewayExposure(trueMinutes(st)),
      lantern: st.chapter === 4 ? 0 : 1,
      lanternX: 0.7,
      salt: 'kit-sea',
    });
    pen.begin('kit-mullions');
    pen.line(WIN.x + WIN.w / 2, WIN.y, WIN.x + WIN.w / 2, WIN.y + WIN.h, { w: 1.3 });
    pen.line(WIN.x, WIN.y + WIN.h * 0.48, WIN.x + WIN.w, WIN.y + WIN.h * 0.48, { w: 1.3 });
    // The kitchen clock is the only one still running.
    pen.begin('kit-clock');
    drawWallClock(pen, CLOCK.x, CLOCK.y, CLOCK.r, houseMinutes(st));
    // Steam from the kettle, while the boiler (and Abel's visits) keep the house warm.
    if (st.chapter < 4) {
      const c = pen.ctx;
      c.strokeStyle = 'rgba(31,27,26,0.3)';
      c.lineWidth = 0.7;
      c.beginPath();
      for (let i = 0; i < 3; i++) {
        const y0 = 116 - ((t * 12 + i * 14) % 42);
        c.moveTo(236 + Math.sin(t * 2 + i) * 3, y0);
        c.quadraticCurveTo(240 + Math.sin(t * 1.3 + i) * 5, y0 - 8, 236 + Math.sin(t + i) * 4, y0 - 16);
      }
      c.stroke();
    }
  },

  drawLit(pen, st, t, f) {
    const p = f.settings.get('reduceFlicker') ? 0.9 : 0.8 + 0.2 * vnoise(t * 4);
    flame(pen, 147, 202, p, t);
    flame(pen, 160, 203, p * 0.8, t + 1);
  },

  hotspots: [
    {
      id: 'backstair',
      label: (st) => (st.chapter === 4 ? 'the back stair' : 'the back stair (up)'),
      verb: 'Go to',
      x: 28,
      y: 96,
      w: 54,
      h: 160,
      approachX: 56,
      async onInteract(g) {
        if (g.state.chapter === 4) await g.goTo('backstair', { x: 60, facing: 1 });
        else await g.goTo('nursery', { x: 678, facing: -1 });
      },
    },
    {
      id: 'stove',
      label: 'range',
      x: 108,
      y: 112,
      w: 144,
      h: 144,
      approachX: 180,
      async onInteract(g) {
        if (g.state.chapter === 4) {
          await g.say('Still warm from the night. Only warm.');
          return;
        }
        await g.say('The range is lit, low. The kettle on it is warm.', 'Somebody boiled it tonight — while I was locked upstairs.');
        g.addClue('warm_kettle');
      },
    },
    {
      id: 'tea',
      label: 'mug',
      x: 278,
      y: 194,
      w: 26,
      h: 20,
      async onInteract(g) {
        await g.say('Half a mug of tea. Milk, two sugars. Still warm.', 'Wren takes it black. So do I.');
        g.addClue('strangers_tea');
      },
    },
    {
      id: 'phone',
      label: 'mobile phone',
      x: 310,
      y: 200,
      w: 28,
      h: 14,
      priority: true,
      async onInteract(g) {
        await g.say('Wren’s phone. Dead.', 'There’s a strip of masking tape on the back, in pencil:', g.red('Charged it for you. Ring me. — A.'), 'Whoever A is, he’s been in and out of this kitchen like he lives here.');
        g.addClue('phone_note');
      },
    },
    {
      id: 'answerphone',
      label: 'answerphone',
      x: 362,
      y: 192,
      w: 76,
      h: 24,
      async onInteract(g) {
        if (g.flag('tapeHeard')) {
          await g.read('answerphone');
          return;
        }
        if (!g.flag('cassetteTaken')) {
          g.setFlag('cassetteTaken');
          g.give('cassette');
          await g.say('Father’s old answerphone. The cassette door is hanging open.', 'Somebody pulled the tape out and snapped it.', 'I could mend it, if I had something to stick it with.');
          g.objective('Mend the answerphone tape and play it.');
          return;
        }
        await g.say('No tape in it. The snapped cassette is in my pocket.');
      },
      async onUse(g, item) {
        if (item === 'cassette') {
          await g.say('It’s snapped. It needs mending first — something to stick the ends together.');
          return true;
        }
        if (item !== 'spliced_tape') return false;
        g.take('spliced_tape');
        g.sfx('click');
        await g.say('I thread the mended tape back in and press PLAY.');
        g.sfx('tape', { dur: 6 });
        await g.read('answerphone');
        g.setFlag('tapeHeard');
        g.puzzles.markSolved('tape');
        g.addClue('answerphone');
        g.audio.pulseTension(0.6, 3000);
        await g.say(
          'Abel Rook. A.R. The ferryman — Rook & Son.',
          '“Edmund’s girl.” That’s me. He knows I came to find Wren — so where is she, Abel?',
          'And then he talks to Wren as if she’s still here. In this house.',
          'The bread crock. He hid Father’s keys in the bread crock.',
        );
        g.objective('Find Father’s keys (the bread crock) and get into his workshop.');
        return true;
      },
    },
    {
      id: 'drawer',
      label: 'dresser drawer',
      verb: 'Search',
      x: 450,
      y: 212,
      w: 62,
      h: 20,
      async onInteract(g) {
        if (g.flag('kitDrawer')) {
          await g.say('String, candle ends, a box of matches I’m not going to touch.');
          return;
        }
        g.setFlag('kitDrawer');
        g.sfx('paper');
        g.give('sticky_tape');
        await g.say('String, candle ends, matches — and a roll of sticky tape.');
      },
    },
    {
      id: 'crock',
      label: 'bread crock',
      verb: 'Search',
      x: 454,
      y: 166,
      w: 42,
      h: 32,
      enabled: (st) => !!st.flags.tapeHeard && !st.flags.keysFound,
      async onInteract(g) {
        g.setFlag('keysFound');
        g.give('fathers_keys');
        await g.say('A stale loaf. And under it, Father’s keys.', 'One has a paper tag in his tiny capitals: WORKSHOP.');
        g.objective('Open Father’s workshop (off the hall).');
      },
    },
    {
      id: 'clock',
      label: 'kitchen clock',
      x: CLOCK.x - 24,
      y: CLOCK.y - 24,
      w: 48,
      h: 48,
      async onInteract(g) {
        const house = houseMinutes(g.state);
        await g.say(`The kitchen clock is running. It says ${fmt(house)}.`, 'The only clock in the house that’s still going. Somebody winds it.');
        if (g.story.hasClue('lark_time')) await g.say(`Lark time, though. Forty minutes fast. So it’s really ${fmt(house - 40)}.`);
        g.addClue('kitchen_clock');
      },
    },
    {
      id: 'calendar',
      label: 'calendar',
      x: 600,
      y: 116,
      w: 44,
      h: 56,
      async onInteract(g) {
        await g.read('calendar');
        await g.say('Father never turned the page past March.', '“W’s birthday. 31.” The fourteenth.', 'Thirty-one. Wren’s thirty-one.');
        g.addClue('birthday');
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
        if (g.state.chapter === 4) {
          const exp = causewayExposure(trueMinutes(g.state));
          await g.say(exp >= 1 ? 'Grey light. The causeway stands clear of the water, all the way across.' : exp > 0 ? 'The causeway is coming up out of the sea. Not all of it. Not yet.' : 'Grey light. The sea is still over the causeway.');
          return;
        }
        await g.say('The lantern is still out there on the water, a long way off. The causeway’s drowned.');
      },
    },
    {
      id: 'backdoor',
      label: 'back door',
      x: 658,
      y: 96,
      w: 62,
      h: 160,
      approachX: 688,
      async onInteract(g) {
        g.sfx('locked');
        await g.say('Bolted inside — and padlocked outside, I can hear the chain.', 'The wet boot prints start here.');
      },
    },
    {
      id: 'prints',
      label: 'boot prints',
      x: 250,
      y: 268,
      w: 450,
      h: 34,
      approachX: 600,
      reach: 40,
      async onInteract(g) {
        await g.say('Wet boot prints. Big. A man’s.', 'From the back door to the stove and back again. He comes in, he warms the kettle, he leaves.');
        g.addClue('bootprints');
      },
    },
    {
      id: 'glasshouse',
      label: (st) => (st.flags.greenhouseOpen ? 'the glasshouse' : 'glasshouse door'),
      verb: (st) => (st.flags.greenhouseOpen ? 'Go to' : 'Try'),
      x: 754,
      y: 96,
      w: 62,
      h: 160,
      approachX: 785,
      async onInteract(g) {
        if (g.flag('greenhouseOpen')) {
          await g.goTo('greenhouse', { x: 60, facing: 1 });
          return;
        }
        if (g.has('mothers_keys')) {
          g.sfx('unlock');
          g.setFlag('greenhouseOpen');
          await g.say('Mother’s little key. The glasshouse door sticks, then gives.');
          await g.goTo('greenhouse', { x: 60, facing: 1 });
          return;
        }
        g.sfx('locked');
        await g.say('Mother’s glasshouse. Locked — her keys, not Father’s.', 'Through the glass: dead plants. And somewhere in there, that chirp.');
      },
    },
    {
      id: 'hall',
      label: 'the hall',
      verb: 'Go to',
      x: 842,
      y: 96,
      w: 56,
      h: 160,
      approachX: 860,
      async onInteract(g) {
        await g.goTo('hall', { x: 60, facing: 1 });
      },
    },
  ],
};

