// The cellar. The dragon under the house. The air is thick; she can't stay long until
// the coal-chute hatch is open — and not at all once it gets too bad.
// Chapter 3 puzzle 3: find the crack with the CO alarm, then shut the boiler down in
// the order on Father's brass tag. Behind it, in a tobacco tin, the inquest (Twist 3).

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { vnoise } from '../../core/math.js';
import { FLOOR, floorboards } from '../draw.js';

const W = 920;
const BOILER = { x: 400, y: 120, w: 150, h: 136 };
const CRACK = { x: 576, y: 78 };

export const cellar = {
  id: 'cellar',
  title: 'The cellar',
  width: W,
  walkY: 304,
  bounds: { min: 60, max: 880 },
  spawnX: 70,
  darkness: 0.9,
  paperSeed: 97,
  ambience: 'attic',
  wind: (st) => (st.flags.chuteOpen ? 0.6 : 0.1),
  hazeTarget: (st) => (st.flags.chuteOpen ? 0.55 : 0.85),
  coLevel(x, st) {
    const base = st.flags.chuteOpen ? 140 : 260;
    return base + (st.flags.chuteOpen ? 450 : 700) * Math.exp(-(((x - CRACK.x) / 70) ** 2));
  },

  lights(st, t, f) {
    const L = [{ x: 70, y: 120, r: 110, a: 0.3 }];
    if (!st.flags.boilerOff) {
      const p = f.settings.get('reduceFlicker') ? 0.9 : 0.8 + 0.2 * vnoise(t * 6);
      L.push({ x: BOILER.x + 75, y: 214, r: 170 * p, a: 0.55 });
    }
    if (st.flags.chuteOpen) L.push({ x: 230, y: 40, r: 140, a: 0.45 });
    return L;
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    // Brick walls and a vaulted ceiling.
    pen.begin('cel-bricks');
    for (let y = 30; y < 240; y += 12) {
      pen.line(0, y, W, y, { w: 0.4, alpha: 0.45, passes: 1 });
      for (let x = (y / 12) % 2 ? 0 : 18; x < W; x += 36) pen.line(x, y, x, y + 12, { w: 0.4, alpha: 0.45, passes: 1 });
    }
    pen.line(0, 30, W, 30, { w: 1.4 });
    pen.hatch(0, 0, W, 30, { gap: 2.4, w: 0.6 });
    floorboards(pen, W);

    // Steps up to the hall.
    pen.begin('cel-steps');
    for (let i = 0; i < 8; i++) {
      const x = 20 + i * 12;
      const y = 80 + i * 22;
      pen.line(x, y, x + 30, y, { w: 1.1 });
      pen.line(x + 30, y, x + 30, y + 22, { w: 0.9 });
    }
    pen.line(20, 70, 130, 250, { w: 1.4 });

    // Coal chute hatch, high on the wall.
    pen.begin('cel-chute');
    pen.rect(200, 34, 60, 40, { w: 1.4 });
    if (fl.chuteOpen) {
      pen.fillRect(204, 38, 52, 32, 'rgba(242,235,217,0.35)');
      pen.line(200, 34, 186, 58, { w: 1.2 });
    } else pen.hatch(204, 38, 52, 32, { gap: 2.4, w: 0.6 });
    pen.poly([[214, 74], [250, 74], [270, 140], [196, 140]], { w: 0.9 });
    pen.scribble(204, 150, 60, 30, { w: 0.6, density: 18 });

    // The boiler.
    pen.begin('cel-boiler');
    pen.fillRect(BOILER.x, BOILER.y, BOILER.w, BOILER.h, PAPER_LIGHT, 0.75);
    pen.rect(BOILER.x, BOILER.y, BOILER.w, BOILER.h, { w: 1.8 });
    pen.rect(BOILER.x + 50, BOILER.y + 70, 50, 34, { w: 1.2 });
    pen.hatch(BOILER.x, BOILER.y, 24, BOILER.h, { gap: 2.4, w: 0.6 });
    for (let i = 0; i < 4; i++) pen.line(BOILER.x + 14, BOILER.y + 16 + i * 10, BOILER.x + BOILER.w - 14, BOILER.y + 16 + i * 10, { w: 0.6 });
    // A face, the way Maren drew it, scratched into the casing by a child.
    pen.circle(BOILER.x + 120, BOILER.y + 30, 3, { w: 0.6, alpha: 0.6 });
    pen.circle(BOILER.x + 132, BOILER.y + 30, 3, { w: 0.6, alpha: 0.6 });
    // Flue pipe up and across, with the cracked joint.
    pen.rect(BOILER.x + 120, CRACK.y - 6, 18, BOILER.y - CRACK.y + 6, { w: 1.3 });
    pen.line(BOILER.x + 120, CRACK.y - 6, W - 40, CRACK.y - 6, { w: 1.3 });
    pen.line(BOILER.x + 138, CRACK.y + 12, W - 40, CRACK.y + 12, { w: 1.3 });
    pen.rect(CRACK.x - 6, CRACK.y - 10, 12, 26, { w: 1.2 });
    if (fl.crackFound) {
      pen.line(CRACK.x - 2, CRACK.y - 6, CRACK.x + 3, CRACK.y + 12, { w: 1.4, col: RED });
      pen.scribble(CRACK.x - 10, CRACK.y - 20, 20, 12, { w: 0.6, density: 10 });
    }
    // Pump and pipes to the house.
    pen.begin('cel-pump');
    pen.circle(640, 228, 16, { w: 1.4 });
    pen.line(550, 228, 624, 228, { w: 2 });
    pen.line(656, 228, 700, 228, { w: 2 });
    pen.line(700, 228, 700, 30, { w: 2 });
    pen.text('PUMP', 626, 254, { size: 8, font: FONT_TYPE });
    // Gas meter and cock.
    pen.begin('cel-meter');
    pen.rect(740, 130, 50, 60, { w: 1.4 });
    pen.circle(765, 154, 10, { w: 1 });
    pen.line(765, 190, 765, 230, { w: 2 });
    pen.line(755, 214, 775, 214, { w: 3, col: fl.boilerOff ? INK : RED });
    pen.line(765, 230, 550, 240, { w: 1.6 });
    // Brass tag.
    pen.poly([[790, 200], [820, 202], [818, 218], [788, 216]], { closed: true, w: 1 });
    pen.line(775, 210, 790, 208, { w: 0.6 });
    // The back stair, bricked up by Father.
    pen.begin('cel-bricked');
    pen.rect(830, 110, 60, 146, { w: 1.4 });
    for (let y = 116; y < 256; y += 10) pen.line(830, y, 890, y, { w: 0.6 });
    pen.text('back stair', 832, 104, { size: 9, font: FONT_TYPE, alpha: 0.7 });
    // The tin behind the boiler, once she can reach it.
    if (fl.boilerOff && !fl.inquestRead) {
      pen.begin('cel-tin');
      pen.fillRect(540, 240, 22, 12, PAPER_LIGHT);
      pen.rect(540, 240, 22, 12, { w: 1.1 });
    }
  },

  drawLit(pen, st, t, f) {
    if (st.flags.boilerOff) return;
    // The dragon's breath: red flame in the firebox window.
    const p = f.settings.get('reduceFlicker') ? 0.9 : 0.8 + 0.25 * vnoise(t * 7);
    pen.begin('cel-fire');
    for (let i = 0; i < 4; i++) {
      const x = BOILER.x + 58 + i * 11;
      const c = pen.ctx;
      c.strokeStyle = RED;
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(x, BOILER.y + 102);
      c.quadraticCurveTo(x + 4 + pen.J(1), BOILER.y + 92 - p * 4, x + Math.sin(t * 6 + i) * 2, BOILER.y + 78 - p * 6);
      c.quadraticCurveTo(x - 4 + pen.J(1), BOILER.y + 92, x, BOILER.y + 102);
      c.stroke();
    }
  },

  hotspots: [
    {
      id: 'steps',
      label: 'the hall',
      verb: 'Go up to',
      x: 20,
      y: 70,
      w: 110,
      h: 186,
      approachX: 70,
      async onInteract(g) {
        await g.goTo('hall', { x: 815, facing: -1 });
      },
    },
    {
      id: 'chute',
      label: (st) => (st.flags.chuteOpen ? 'coal chute (open)' : 'coal chute hatch'),
      verb: (st) => (st.flags.chuteOpen ? 'Inspect' : 'Open'),
      x: 186,
      y: 30,
      w: 80,
      h: 160,
      approachX: 230,
      async onInteract(g) {
        if (g.flag('chuteOpen')) {
          await g.say('Cold air pouring down the chute. I can breathe a little.');
          return;
        }
        g.setFlag('chuteOpen');
        g.sfx('window');
        await g.say('I climb the coal heap and shove the hatch up. Rain and cold air come down on me.', 'Better. A little.');
      },
    },
    {
      id: 'boiler',
      label: 'boiler',
      x: BOILER.x,
      y: BOILER.y,
      w: BOILER.w,
      h: BOILER.h,
      async onInteract(g) {
        if (g.flag('boilerOff')) {
          await g.say('Cold. Ticking as it cools. Just a lump of iron.');
          return;
        }
        await g.say('The boiler. Father’s “unwell” boiler. Lit and roaring.', 'There are scratches on the casing: two eyes. A child drew a face on it once.', 'The dragon under the house.');
        if (!g.flag('crackFound')) await g.say(g.has('co_alarm') ? 'The alarm’s worse up near the flue pipe. Further along.' : 'I need to know where it’s leaking.');
      },
    },
    {
      id: 'crack',
      label: 'flue joint',
      x: CRACK.x - 16,
      y: CRACK.y - 22,
      w: 32,
      h: 44,
      approachX: CRACK.x,
      reach: 30,
      enabled: (st) => st.inventory.includes('co_alarm'),
      async onInteract(g) {
        if (g.flag('crackFound')) {
          await g.say('The cracked joint. Black with twenty-two years of soot.');
          return;
        }
        g.setFlag('crackFound');
        g.sfx('alarm');
        g.annotate('cellar', { id: 'crack-circle', type: 'circle', x: CRACK.x - 20, y: CRACK.y - 22, w: 40, h: 44 });
        g.annotate('cellar', { id: 'crack-note', type: 'text', text: 'here.', x: CRACK.x + 22, y: CRACK.y - 12, size: 18 });
        g.addClue('the_crack');
        await g.say('The alarm is screaming.', 'Here — the joint in the flue pipe. Split right through, black with soot. You could post a letter through it.', 'It’s been leaking into the house for days. It leaked for weeks in 2004.', 'Shut it down. Father’s tag is on the gas pipe.');
        g.objective('Shut the boiler down — in the order on Father’s brass tag.');
      },
    },
    {
      id: 'tag',
      label: 'brass tag',
      verb: 'Read',
      x: 784,
      y: 194,
      w: 40,
      h: 28,
      priority: true,
      async onInteract(g) {
        await g.read('shutdown_tag');
      },
    },
    {
      id: 'controls',
      label: 'gas cock, pump and flue',
      verb: (st) => (st.flags.boilerOff ? 'Inspect' : 'Shut down'),
      x: 610,
      y: 120,
      w: 190,
      h: 136,
      approachX: 700,
      async onInteract(g) {
        if (g.flag('boilerOff')) {
          await g.say('Gas off. Pump off. The radiators upstairs will be going cold.');
          return;
        }
        if (!g.flag('crackFound')) {
          await g.say('The gas cock, the pump switch, the flue damper. I don’t even know if this is where it’s coming from yet.');
          if (!g.has('co_alarm')) await g.say('Something to measure the air with…');
          return;
        }
        const ok = await g.puzzles.openOrder('boiler_shutdown');
        if (!ok) return;
        await shutDown(g);
      },
    },
    {
      id: 'bricked',
      label: 'bricked doorway',
      x: 826,
      y: 104,
      w: 68,
      h: 152,
      async onInteract(g) {
        await g.say('The bottom of the back stair. Father bricked it up after the fire.', 'There’s pencil on the bricks, low down, in his hand: “M.”', 'Just that. And a small cross.');
      },
    },
    {
      id: 'tin',
      label: 'tobacco tin',
      x: 534,
      y: 232,
      w: 34,
      h: 24,
      priority: true,
      enabled: (st) => !!st.flags.boilerOff && !st.flags.inquestRead,
      async onInteract(g) {
        await twist3(g);
      },
    },
  ],

  async onEnter(g) {
    if (!g.flag('cellarSeen')) {
      g.setFlag('cellarSeen');
      g.audio.setTension(0.5);
      await g.say('Warm. Thick. The air tastes of pennies.', 'My head— I can’t stay down here long. Not like this.');
      g.objective(g.has('co_alarm') ? 'Follow the alarm to the leak. Open the coal chute for air.' : 'Find where it’s leaking. Open the coal chute for air.');
      g.phantom.summon({ x: BOILER.x + 190, footY: FLOOR, height: 160, delay: 0.5, linger: 5, onCaught: () => g.scare({ shake: 0.4 }) });
    }
  },

  /** Too long in bad air and she has to get out. Not a death — a retreat. */
  onUpdate(g) {
    const st = g.state;
    if (st.flags.boilerOff || st.haze < 0.8 || g.busy || g.ui.blocking()) return;
    if (g.roomTimers.cellarRetreat) return;
    g.roomTimers.cellarRetreat = true;
    g.ambient(async () => {
      g.sfx('heartbeat');
      g.flickerTorch(1.5);
      await g.say('I can’t— the walls are leaning in—', 'Air. I need air.');
      st.haze = 0.5;
      await g.goTo('hall', { x: 815, facing: -1 });
      g.roomTimers.cellarRetreat = false;
      await g.say('…The hall. I don’t remember the steps.', st.flags.chuteOpen ? 'I’ll be quicker this time.' : 'The coal chute. If I opened it, I could breathe down there.');
    });
  },
};

async function shutDown(g) {
  g.sfx('gas');
  g.setFlag('boilerOff');
  g.addClue('shut_down');
  g.audio.setTension(0.2);
  await g.say('Gas — off. The roar drops to nothing.', 'The pilot: out. I look, the way he said.', 'The pump: off. Somewhere above me the radiators give one last knock and stop.', 'And the air: I open the damper and the cold comes through.');
  await g.say('Silence. For the first time since I woke up, the house is quiet.', 'Behind the boiler, where it was too hot to reach — a tobacco tin.');
  g.objective('The tin behind the boiler.');
}

/** Twist 3: Maren died in 2004. */
async function twist3(g) {
  g.setFlag('inquestRead');
  g.sfx('paper');
  await g.say('A tobacco tin, pushed into the gap behind the boiler. Father’s writing on the lid:', g.red('Where it happened. Not for Wren. Not yet.'));
  await g.read('inquest');
  g.addClue('inquest');
  g.sfx('heartbeat');
  g.audio.pulseTension(1, 6000);
  await g.say(
    'Maren Elizabeth Lark. Aged thirteen.',
    '…No.',
    'I went to Aunt Hester’s. I went to Leeds after the fire. My marks stop in 2004 because I went away.',
    'Maren went back in for Father. Maren was found at the foot of the back stair.',
    'Wren was carried off the porch roof by Abel Rook.',
  );
  g.addEntry('maren');
  await g.openJournal('maren');
  await g.say('Then who has been writing in my journal?', 'Then who am I?');
  await g.chapterEnd();
}

export const SHUTDOWN_PUZZLE = {
  kind: 'order',
  title: 'Shutting her down',
  intro: 'Father’s brass tag is on the gas pipe. Four things to do, in the right order.',
  cards: [
    { id: 'air', label: 'Open the flue damper', detail: 'let the cellar air out' },
    { id: 'pump', label: 'Switch off the pump', detail: 'stop the water circulating' },
    { id: 'gas', label: 'Turn the gas cock off', detail: 'at the meter' },
    { id: 'pilot', label: 'Check the pilot flame', detail: 'make sure it has gone out' },
  ],
  solution: ['gas', 'pilot', 'pump', 'air'],
  solvedText: 'Gas, pilot, pump, air.',
  onWrong(order, g) {
    if (order.indexOf('air') < order.indexOf('gas')) {
      g.shake = 0.5;
      g.sfx('gas');
      return { message: 'The draught hits the flame and it roars back out of the firebox at me.', red: 'Air LAST.' };
    }
    if (order.indexOf('pump') < order.indexOf('pilot')) {
      g.sfx('knock', { volume: 1.2 });
      return { message: 'The pipes bang like a gunshot — the water’s boiling in the jacket.', red: 'Not while she’s still alight.' };
    }
    return { message: 'Not like that. Father’s tag.', red: 'The gas comes first. Always.' };
  },
};
