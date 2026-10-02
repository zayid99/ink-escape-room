// Chapter 1 · Room 1 — the attic study, where she wakes.
// Puzzle 1 ("The Locked Door"): slide the tide table under the door, push the key out
// with a hairpin, pull the paper back.

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { vnoise } from '../../core/math.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowNight, doorClosed, doorOpen, clockFace, flame } from '../draw.js';

const W = 760;
const WIN = { x: 236, y: 76, w: 80, h: 110 };
const CANDLE = { x: 500, y: 182 };

function candlePower(t, reduce) {
  return reduce ? 0.92 + 0.04 * vnoise(t * 1.5) : 0.82 + 0.22 * vnoise(t * 5.3) + 0.06 * vnoise(t * 17);
}

export const study = {
  id: 'study',
  title: 'The attic room',
  width: W,
  walkY: 304,
  bounds: { min: 34, max: 728 },
  spawnX: 455,
  darkness: 0.84,
  paperSeed: 11,
  ambience: 'attic',
  wind: (st) => (st.flags.windowClosed ? 0.2 : 0.9),
  // Shutting the window lets the air go bad. (She doesn't know why her head hurts.)
  hazeTarget: (st) => (st.flags.windowClosed ? 0.58 : 0.12),

  lights(st, t, f) {
    const p = candlePower(t, f.settings.get('reduceFlicker'));
    const lights = [{ x: CANDLE.x, y: CANDLE.y, r: 175 * p, a: 0.95 * p, core: 0.2 }];
    lights.push({ x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2, r: 80, a: st.flags.windowClosed ? 0.25 : 0.38 });
    return lights;
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    wallpaper(pen, W, 24, 240, { salt: 'study-wall' });

    // Attic roof: sloped ceiling either side, hatched void above.
    pen.begin('study-roof');
    const leftVoid = [[0, 0], [150, 0], [150, 22], [0, 118]];
    const rightVoid = [[610, 0], [W, 0], [W, 118], [610, 22]];
    for (const poly of [leftVoid, rightVoid, [[150, 0], [610, 0], [610, 22], [150, 22]]]) {
      pen.fillPoly(poly, '#d7ccb2');
      pen.hatchPoly(poly, { gap: 2.6, w: 0.6, alpha: 0.9 });
    }
    pen.line(0, 118, 150, 22, { w: 1.6 });
    pen.line(150, 22, 610, 22, { w: 1.4 });
    pen.line(610, 22, W, 118, { w: 1.6 });
    for (let i = 1; i < 4; i++) {
      pen.line(i * 38, 118 - i * 24, i * 38 + 6, 118 - i * 24 - 30, { w: 0.6, alpha: 0.6 });
      pen.line(W - i * 38, 118 - i * 24, W - i * 38 - 6, 118 - i * 24 - 30, { w: 0.6, alpha: 0.6 });
    }

    skirting(pen, W);
    floorboards(pen, W);

    // Iron bed.
    pen.begin('study-bed');
    pen.line(44, 178, 44, FLOOR, { w: 2 });
    pen.line(52, 186, 52, FLOOR - 26, { w: 1.2 });
    pen.ellipse(48, 180, 6, 4, { w: 1.2 });
    pen.line(168, 204, 168, FLOOR, { w: 2 });
    pen.fillPoly([[50, 214], [164, 214], [166, 232], [50, 232]], PAPER_LIGHT);
    pen.rect(50, 214, 114, 18, { w: 1.2 });
    pen.fillEllipse(70, 209, 16, 6, PAPER_LIGHT);
    pen.ellipse(70, 209, 16, 6, { w: 1 });
    // Rumpled blanket, thrown back.
    pen.poly([[86, 210], [120, 206], [150, 214], [160, 238], [128, 244], [94, 236]], { closed: true, w: 1.1 });
    pen.hatch(94, 214, 66, 28, { gap: 3, w: 0.5, alpha: 0.6 });
    pen.crossHatch(50, 232, 118, 24, { gap: 2.2, w: 0.6 });

    // Window (frame static, contents dynamic).
    windowFrame(pen, WIN.x, WIN.y, WIN.w, WIN.h, { salt: 'study-window' });
    if (!fl.windowClosed) {
      pen.begin('study-casement');
      const leaf = [[WIN.x, WIN.y], [WIN.x - 20, WIN.y + 9], [WIN.x - 20, WIN.y + WIN.h - 4], [WIN.x, WIN.y + WIN.h]];
      pen.fillPoly(leaf, PAPER_LIGHT, 0.85);
      pen.poly(leaf, { closed: true, w: 1.2 });
      pen.line(WIN.x - 10, WIN.y + 5, WIN.x - 10, WIN.y + WIN.h - 2, { w: 0.8 });
      // The folded matchbook wedge.
      pen.fillRect(WIN.x - 3, WIN.y + WIN.h - 4, 7, 5, INK);
    }

    // Tide table pinned to the wall.
    pen.begin('study-tide');
    if (!fl.tideTaken) {
      pen.fillPoly([[328, 118], [352, 120], [351, 152], [327, 150]], PAPER_LIGHT);
      pen.poly([[328, 118], [352, 120], [351, 152], [327, 150]], { closed: true, w: 1 });
      for (let i = 0; i < 5; i++) pen.line(331, 127 + i * 5, 348, 128 + i * 5, { w: 0.5, passes: 1 });
      pen.circle(333, 129, 2.4, { col: RED, w: 0.8 });
    } else {
      pen.rect(328, 118, 24, 33, { w: 0.4, alpha: 0.35 });
    }
    pen.fillEllipse(340, 120, 1.6, 1.6, INK);

    // Desk.
    pen.begin('study-desk');
    pen.fillRect(384, 194, 144, 7, PAPER_LIGHT);
    pen.rect(384, 194, 144, 7, { w: 1.4 });
    pen.rect(392, 201, 128, 22, { w: 1.1 });
    pen.rect(398, 204, 50, 15, { w: 0.9 });
    pen.circle(423, 211, 1.8, { w: 1 });
    pen.hatch(454, 203, 64, 18, { gap: 2.6, w: 0.5, alpha: 0.7 });
    pen.line(390, 201, 390, FLOOR, { w: 1.6 });
    pen.line(522, 201, 522, FLOOR, { w: 1.6 });
    pen.crossHatch(392, 223, 128, 33, { gap: 2.4, w: 0.55 });
    // Papers.
    pen.fillPoly([[478, 191], [494, 189], [496, 194], [476, 195]], PAPER_LIGHT);
    pen.poly([[478, 191], [494, 189], [496, 194], [476, 195]], { closed: true, w: 0.6 });

    // Carriage clock, stopped at 3:17.
    pen.begin('study-clock');
    pen.fillRect(402, 172, 24, 22, PAPER_LIGHT);
    pen.rect(402, 172, 24, 22, { w: 1.2 });
    pen.ellipse(414, 168, 6, 3, { w: 1 });
    clockFace(pen, 414, 183, 8, 3, 17, { w: 0.9 });

    // The journal, until she picks it up.
    if (!fl.hasJournal) {
      pen.begin('study-journal');
      pen.fillPoly([[438, 193], [456, 189], [474, 193], [456, 195]], PAPER_LIGHT);
      pen.poly([[438, 193], [456, 189], [474, 193], [456, 195]], { closed: true, w: 1 });
      pen.line(456, 189, 456, 195, { w: 0.8 });
      pen.line(462, 191, 470, 192, { col: RED, w: 0.7, passes: 1 });
    }

    // Candle holder (flame is drawn after lighting).
    pen.begin('study-candle');
    pen.ellipse(CANDLE.x, 194, 9, 2.4, { w: 1 });
    pen.fillRect(CANDLE.x - 3, 184, 6, 10, PAPER_LIGHT);
    pen.rect(CANDLE.x - 3, 184, 6, 10, { w: 0.9 });
    pen.line(CANDLE.x + 2, 186, CANDLE.x + 2.5, 191, { w: 0.6 });

    // Smoke alarm on the ceiling, cover hanging open.
    pen.begin('study-alarm');
    pen.fillEllipse(453, 27, 11, 4, PAPER_LIGHT);
    pen.ellipse(453, 27, 11, 4, { w: 1 });
    pen.line(444, 29, 438, 44, { w: 0.6 });
    pen.line(447, 30, 443, 44, { w: 0.6 });
    pen.poly([[432, 44], [448, 44], [448, 49], [432, 49]], { closed: true, w: 0.9 });

    // Wastebasket.
    pen.begin('study-basket');
    pen.poly([[538, 228], [564, 228], [560, FLOOR], [542, FLOOR]], { closed: true, w: 1.2 });
    pen.hatch(539, 229, 24, 26, { gap: 3, w: 0.5 });
    pen.hatch(539, 229, 24, 26, { gap: 3, dir: -1, w: 0.5 });
    for (const [x, y] of [[545, 225], [553, 222], [559, 226]]) {
      pen.fillEllipse(x, y, 5, 4, PAPER_LIGHT);
      pen.circle(x, y, 4.5, { w: 0.7 });
    }

    // Wren's suitcase, open.
    pen.begin('study-case');
    const lid = [[586, 224], [664, 224], [672, 194], [594, 194]];
    pen.fillPoly(lid, PAPER_LIGHT, 0.9);
    pen.poly(lid, { closed: true, w: 1.2 });
    pen.hatch(596, 198, 70, 22, { gap: 3, w: 0.4, alpha: 0.6 });
    pen.fillRect(586, 224, 78, 32, PAPER_LIGHT, 0.9);
    pen.rect(586, 224, 78, 32, { w: 1.3 });
    pen.scribble(594, 216, 60, 10, { w: 0.6, density: 16 });
    if (!fl.suitcaseSearched) {
      pen.line(600, 218, 606, 212, { w: 1, col: RED });
      pen.line(603, 219, 609, 213, { w: 1, col: RED });
    }
    // Tag.
    pen.line(664, 232, 672, 238, { w: 0.6 });
    pen.poly([[670, 236], [684, 238], [683, 247], [669, 245]], { closed: true, w: 0.8 });
    pen.text('W.L', 671, 245, { size: 6, font: FONT_TYPE });

    // Door to the landing.
    if (fl.doorOpen) doorOpen(pen, 690, 98, 50, 158, { salt: 'study-door', swing: -1 });
    else {
      doorClosed(pen, 690, 98, 50, 158, { salt: 'study-door', knobSide: -1 });
      pen.begin('study-keyhole');
      pen.fillEllipse(698, 182, 1.2, 2.6, INK);
    }
    if (fl.paperUnder && !fl.keyOut) {
      pen.begin('study-paper-under');
      pen.fillPoly([[684, 254], [722, 254], [724, 262], [682, 262]], PAPER_LIGHT);
      pen.poly([[684, 254], [722, 254], [724, 262], [682, 262]], { closed: true, w: 0.8 });
    }

    // Abel's note on the floor.
    if (!fl.noteRead) {
      pen.begin('study-note');
      pen.fillPoly([[668, 264], [692, 262], [694, 270], [670, 272]], PAPER_LIGHT);
      pen.poly([[668, 264], [692, 262], [694, 270], [670, 272]], { closed: true, w: 0.9 });
      pen.line(680, 263, 682, 271, { w: 0.5 });
    }
  },

  drawDynamic(pen, st, t) {
    windowNight(pen, WIN.x, WIN.y, WIN.w, WIN.h, t, { lantern: 1, salt: 'study-night' });
    // Re-draw the mullions over the night so the frame reads clearly.
    pen.begin('study-mullions');
    pen.line(WIN.x + WIN.w / 2, WIN.y, WIN.x + WIN.w / 2, WIN.y + WIN.h, { w: 1.3 });
    pen.line(WIN.x, WIN.y + WIN.h * 0.48, WIN.x + WIN.w, WIN.y + WIN.h * 0.48, { w: 1.3 });
    // Draught: the curtainless window lets the rain in.
    if (!st.flags.windowClosed) {
      const c = pen.ctx;
      c.strokeStyle = 'rgba(31,27,26,0.35)';
      c.lineWidth = 0.6;
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const y = WIN.y + 30 + i * 16 + Math.sin(t * 2 + i) * 3;
        c.moveTo(WIN.x + WIN.w + 10, y);
        c.bezierCurveTo(WIN.x + WIN.w + 40, y - 6, WIN.x + WIN.w + 60, y + 6, WIN.x + WIN.w + 90 + Math.sin(t + i) * 10, y);
      }
      c.stroke();
    }
  },

  drawLit(pen, st, t, f) {
    flame(pen, CANDLE.x, 184, candlePower(t, f.settings.get('reduceFlicker')), t);
  },

  hotspots: [
    {
      id: 'bed',
      label: 'bed',
      x: 40,
      y: 180,
      w: 132,
      h: 76,
      async onInteract(g) {
        await g.say('The blanket’s been slept in. More than once, by the look of it.', 'I don’t remember lying down here. I don’t remember anything after the ferry.');
        g.addClue('slept_in');
      },
    },
    {
      id: 'window',
      label: 'window',
      verb: (st) => (st.flags.windowClosed ? 'Open' : 'Close'),
      x: WIN.x - 20,
      y: WIN.y,
      w: WIN.w + 20,
      h: WIN.h,
      async onInteract(g) {
        if (!g.flag('windowClosed')) {
          if (!g.flag('sawLantern')) {
            await g.say('There’s a light out on the causeway. A lantern, moving away from the island.', 'Who walks the causeway at this hour? It’ll be under water soon.');
            g.setFlag('sawLantern');
          }
          await g.say('The window’s been wedged open with a folded matchbook. The rain’s getting in.', 'I pull the matchbook out and shut it.');
          g.sfx('window');
          g.setFlag('windowClosed');
          g.audio.setWind(0.2);
          g.give('matchbook');
          g.addClue('window_wedged');
        } else {
          await g.say('I push it open again. The cold air helps my head.');
          g.sfx('window');
          g.setFlag('windowClosed', false);
          g.audio.setWind(0.9);
        }
      },
    },
    {
      id: 'tide_table',
      label: 'tide table',
      verb: 'Take',
      x: 322,
      y: 114,
      w: 34,
      h: 42,
      enabled: (st) => !st.flags.tideTaken,
      async onInteract(g) {
        g.setFlag('tideTaken');
        g.give('tide_table');
        await g.say('A tide table for the causeway, pinned by the window. Father’s pencil all over it.', 'Thin card. Flat as a playing card.');
      },
    },
    {
      id: 'drawer',
      label: 'desk drawer',
      verb: 'Search',
      x: 396,
      y: 202,
      w: 54,
      h: 20,
      async onInteract(g) {
        if (g.flag('drawerSearched')) {
          await g.say('Pens. String. Nothing else.');
          return;
        }
        g.sfx('paper');
        await g.say('Pens. String. A twist of paper wrapped round something hard.', 'A battery — the square kind, for a smoke alarm. The paper says:', g.red('SHUT UP SHUT UP SHUT UP'));
        g.setFlag('drawerSearched');
        g.give('battery');
        g.addClue('alarm_battery');
      },
    },
    {
      id: 'clock',
      label: 'carriage clock',
      x: 400,
      y: 164,
      w: 30,
      h: 32,
      async onInteract(g) {
        await g.say('Father’s carriage clock. Stopped at 3:17.', 'Someone’s circled it in red and written beside it:', g.red('3:17 again?'), 'Again?');
        if (g.story.hasClue('lark_time')) await g.say('Forty minutes fast, like all of Father’s clocks. So it wasn’t really 3:17 when it stopped.');
        g.addClue('clock_317');
      },
    },
    {
      id: 'journal',
      label: 'journal',
      verb: 'Take',
      x: 436,
      y: 184,
      w: 40,
      h: 14,
      priority: true,
      enabled: (st) => !st.flags.hasJournal,
      async onInteract(g) {
        g.setFlag('hasJournal');
        g.sfx('page');
        await g.say('My journal. I’ve had it since I was twelve.', 'Somebody has written inside the cover.');
        await g.read('journal_cover');
        await g.say('Red ink. Wren only ever wrote in red — when we were small she used to “correct” my drawings with it.', 'So she was here. Writing in my journal.', 'It’s signed W. Then the W is crossed out. M.', '…I’m M.');
        g.addClue('cover_note');
        g.addEntry('old_tallman', { silent: true });
        g.addEntry('old_red', { silent: true });
        g.addEntry('tonight', { silent: true });
        g.hud.hint('Journal taken — press J (or the Journal button) to read it.', 6000);
      },
    },
    {
      id: 'candle',
      label: 'candle',
      x: 490,
      y: 166,
      w: 20,
      h: 30,
      async onInteract(g) {
        await g.say('Lit, and burned right down.', 'I don’t remember lighting it.');
        if (g.state.haze > 0.4) await g.say('The flame’s low and lazy, like it can’t get enough air.');
      },
    },
    {
      id: 'alarm',
      label: 'smoke alarm',
      x: 430,
      y: 16,
      w: 40,
      h: 36,
      approachX: 453,
      reach: 60,
      async onInteract(g) {
        await g.say('The smoke alarm on the ceiling. Its cover is hanging open and the battery’s gone.', 'Something in this house chirps every minute or so. At least it isn’t this one.');
      },
      async onUse(g, item) {
        if (item !== 'battery') return false;
        await g.say('The contacts are snapped clean off. Someone tore it apart to make it stop.', 'I keep the battery.');
        return true;
      },
    },
    {
      id: 'basket',
      label: 'wastebasket',
      x: 534,
      y: 216,
      w: 34,
      h: 40,
      async onInteract(g) {
        await g.read('crumpled');
        await g.say('The same drawing, over and over. A tall, thin shape in a doorway.', 'Every one crossed out. In red.', 'Wren… what were you seeing?');
        g.addClue('tall_man_drawings');
      },
    },
    {
      id: 'suitcase',
      label: 'suitcase',
      verb: 'Search',
      x: 584,
      y: 192,
      w: 102,
      h: 64,
      async onInteract(g) {
        if (g.flag('suitcaseSearched')) {
          await g.say('Wren’s jumpers. They smell of her soap.', 'Same as mine. We always did buy the same one.');
          return;
        }
        g.sfx('paper');
        await g.say(
          'Wren’s suitcase. The tag says W. LARK, in her handwriting.',
          'Her jumpers. Her washbag. A box of red fineliners — one missing.',
          'Hairpins. I’ll take one.',
          'And in the front pocket, a ferry ticket.',
        );
        g.setFlag('suitcaseSearched');
        g.give('hairpin');
        g.give('ferry_ticket');
        g.addClue('suitcase');
        g.addClue('ferry_ticket', { silent: true });
      },
    },
    {
      id: 'note',
      label: 'folded paper',
      verb: 'Pick up',
      x: 664,
      y: 258,
      w: 34,
      h: 18,
      priority: true,
      enabled: (st) => !st.flags.noteRead,
      async onInteract(g) {
        g.setFlag('noteRead');
        await g.read('abel_note');
        await g.say(
          'Wren. It’s addressed to Wren.',
          'Whoever A.R. is, he’s been locking my sister in this room at night.',
          '“You walked into the water.” “You won’t remember.” What has he been telling her?',
          '…Or he’s mistaken me for her. Or he never knew there were two of us.',
        );
        g.addClue('abel_note');
      },
    },
    {
      id: 'door',
      label: (st) => (st.flags.doorOpen ? 'the landing' : 'door'),
      verb: (st) => (st.flags.doorOpen ? 'Go to' : 'Try'),
      x: 688,
      y: 96,
      w: 56,
      h: 160,
      approachX: 712,
      async onInteract(g) {
        if (g.flag('doorOpen')) {
          await g.goTo('landing', { x: 70, facing: 1 });
          return;
        }
        if (g.has('study_key')) {
          await unlockDoor(g);
          return;
        }
        g.sfx('locked');
        if (!g.flag('doorTried')) {
          g.setFlag('doorTried');
          await g.say('Locked.', 'Locked from the outside.', 'Through the keyhole I can see the key. It’s still in the lock — on the landing side.');
          if (!g.flag('noteRead')) await g.say('There’s a folded paper on the floor by the door.');
          await g.say('If I had something flat to slide under the door… and something thin to push the key out with…');
          g.objective('Get the key from the other side of the door.');
          return;
        }
        if (g.flag('keyOut')) await g.say('The key’s on the paper. I just need to pull it back through.');
        else if (g.flag('paperUnder')) await g.say('The paper’s under the door, right below the lock. Now something thin, to push the key through.');
        else await g.say('The key’s in the lock on the other side. Something flat under the door. Something thin through the keyhole.');
      },
      async onUse(g, item) {
        if (g.flag('doorOpen')) return false;
        if (item === 'tide_table') {
          if (g.flag('paperUnder')) {
            await g.say('It’s already under there.');
            return true;
          }
          g.take('tide_table');
          g.sfx('paper');
          g.setFlag('paperUnder');
          g.puzzles.completeStep('study_door', 'paper');
          await g.say('I slide the tide table under the door, right below the lock.');
          return true;
        }
        if (item === 'hairpin') {
          if (!g.flag('paperUnder')) {
            await g.say('If I push the key out now it’ll drop on the landing floor, and I’ll never reach it.', 'I need something under the door to catch it first.');
            return true;
          }
          g.sfx('click');
          await g.wait(350);
          g.sfx('keydrop');
          g.setFlag('keyOut');
          g.puzzles.completeStep('study_door', 'push');
          await g.say('A push. A scrape. A clink on the other side.', 'Now — slowly —');
          g.sfx('paper');
          await g.wait(400);
          g.give('tide_table', { silent: true });
          g.give('study_key');
          g.setFlag('paperUnder', false);
          await g.say('The tide table slides back under the door. The key is lying on it.');
          return true;
        }
        if (item === 'study_key') {
          await unlockDoor(g);
          return true;
        }
        return false;
      },
    },
  ],

  onUpdate(g) {
    if (g.state.haze > 0.42 && !g.flag('headache')) {
      g.setFlag('headache');
      g.ambient(async () => {
        g.sfx('heartbeat', { volume: 0.5 });
        await g.say('My head’s pounding. It’s so stuffy in here.');
      });
    }
  },
};

async function unlockDoor(g) {
  g.sfx('unlock');
  g.take('study_key');
  g.setFlag('doorOpen');
  g.puzzles.completeStep('study_door', 'key');
  await g.say('The key turns. The door swings out onto the landing.');
  g.objective('Find a way downstairs.');
  await g.goTo('landing', { x: 70, facing: 1 });
}
