// Mother's glasshouse, off the kitchen. The chirp she has heard all night lives here:
// Abel's carbon-monoxide alarm on the boiler pipe, with a dying battery.
// Chapter 3 puzzle 1: bring it back to life with the battery from the study drawer.

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { FLOOR, floorboards, windowSea, doorOpen } from '../draw.js';

const W = 820;
const ALARM = { x: 560, y: 196 };

export const greenhouse = {
  id: 'greenhouse',
  title: 'The glasshouse',
  width: W,
  walkY: 304,
  bounds: { min: 46, max: 780 },
  spawnX: 60,
  darkness: 0.74,
  paperSeed: 83,
  ambience: 'attic',
  wind: () => 1,
  hazeTarget: () => 0.42,
  coLevel: (x) => 120 + 90 * Math.exp(-(((x - 560) / 120) ** 2)),

  lights(st, t) {
    return [
      { x: 400, y: 80, r: 360, a: 0.32 },
      ...(st.flags.alarmFixed ? [{ x: ALARM.x, y: ALARM.y, r: 40, a: 0.4 + 0.3 * Math.round((t * 2) % 1) }] : []),
    ];
  },

  drawStatic(pen, st) {
    // Glass walls: a lattice of glazing bars, sky hatched dark behind.
    pen.begin('gh-glass');
    pen.fillRect(0, 0, W, FLOOR, 'rgba(40,34,40,0.35)');
    pen.hatch(0, 0, W, FLOOR, { gap: 3, w: 0.45, alpha: 0.5 });
    for (let x = 0; x <= W; x += 64) pen.line(x, 30, x, FLOOR, { w: 1.2 });
    for (const y of [30, 100, 170]) pen.line(0, y, W, y, { w: 1 });
    pen.line(0, 30, W / 2, 0, { w: 1.4 });
    pen.line(W / 2, 0, W, 30, { w: 1.4 });
    floorboards(pen, W);

    doorOpen(pen, 24, 98, 50, 158, { salt: 'gh-door', swing: 1 });
    pen.text('kitchen', 26, 92, { size: 9, font: FONT_TYPE, col: PAPER_LIGHT, alpha: 0.8 });

    // Staging with dead plants.
    pen.begin('gh-staging');
    pen.fillRect(110, 196, 300, 6, PAPER_LIGHT);
    pen.rect(110, 196, 300, 6, { w: 1.3 });
    for (const x of [116, 404]) pen.line(x, 202, x, FLOOR, { w: 1.4 });
    for (let i = 0; i < 8; i++) {
      const x = 130 + i * 36;
      pen.poly([[x - 9, 196], [x + 9, 196], [x + 6, 178], [x - 6, 178]], { closed: true, w: 1 });
      for (let k = 0; k < 4; k++) pen.line(x, 178, x - 10 + k * 7, 150 + ((i + k) % 3) * 8, { w: 0.7 });
      pen.line(x - 10, 158, x - 14, 168, { w: 0.6 });
    }
    // Potting book on the end.
    pen.fillPoly([[360, 190], [392, 188], [394, 195], [358, 196]], PAPER_LIGHT);
    pen.poly([[360, 190], [392, 188], [394, 195], [358, 196]], { closed: true, w: 0.9 });

    // Canary cage hanging from a bracket.
    pen.begin('gh-cage');
    pen.line(470, 30, 470, 70, { w: 1 });
    pen.ellipse(470, 84, 26, 12, { w: 1.2, frac: 0.5, overshoot: 0 });
    for (let i = 0; i < 9; i++) pen.line(446 + i * 6, 80, 446 + i * 6, 130, { w: 0.7 });
    pen.line(444, 130, 496, 130, { w: 1.2 });
    pen.line(452, 112, 488, 112, { w: 0.6 });
    pen.fillEllipse(462, 127, 5, 2.5, INK);
    pen.fillEllipse(478, 127, 5, 2.5, INK);

    // The boiler pipe: runs along the floor from the cellar wall and up past the alarm.
    pen.begin('gh-pipe');
    pen.line(W, 240, 520, 240, { w: 3 });
    pen.line(520, 240, 520, 150, { w: 3 });
    pen.hatch(520, 150, 6, 90, { gap: 2, w: 0.5 });
    pen.text('from the cellar →', W - 120, 232, { size: 9, font: FONT_TYPE, col: PAPER_LIGHT, alpha: 0.8 });
    // Alarm on a bracket.
    pen.line(526, 200, 548, 200, { w: 1.2 });
    pen.fillEllipse(ALARM.x, ALARM.y, 13, 13, PAPER_LIGHT);
    pen.circle(ALARM.x, ALARM.y, 13, { w: 1.4 });
    pen.text('CO', ALARM.x - 7, ALARM.y + 4, { size: 8, font: FONT_TYPE });
    pen.poly([[572, 204], [590, 206], [589, 214], [571, 212]], { closed: true, w: 0.8 });

    // A wheelbarrow and tools by the far end.
    pen.begin('gh-barrow');
    pen.poly([[640, 236], [720, 228], [710, 252], [650, 254]], { closed: true, w: 1.2 });
    pen.circle(660, 254, 7, { w: 1.2 });
    pen.line(720, 228, 760, 246, { w: 1.2 });
  },

  drawDynamic(pen, st, t) {
    // The sea glimpsed through the far glass.
    windowSea(pen, 704, 40, 110, 120, t, { lantern: st.chapter === 4 ? 0 : 1, lanternX: 0.4, salt: 'gh-sea', dawn: st.chapter === 4 ? 0.7 : 0 });
    // Rain streaming down the glass.
    const c = pen.ctx;
    c.strokeStyle = 'rgba(242,235,217,0.25)';
    c.lineWidth = 0.6;
    c.beginPath();
    for (let i = 0; i < 30; i++) {
      const x = (i * 29) % W;
      const y = ((t * 60 + i * 47) % 200) + 30;
      c.moveTo(x, y);
      c.lineTo(x + 1, y + 12);
    }
    c.stroke();
  },

  drawLit(pen, st, t) {
    // The alarm's light: a slow red blink (low battery) or a frantic one (alarm).
    const fast = st.flags.alarmFixed && !st.flags.boilerOff;
    const on = fast ? Math.round((t * 4) % 1) : (t % 6) < 0.15;
    if (on && !(st.flags.alarmFixed && st.inventory.includes('co_alarm'))) pen.fillEllipse(ALARM.x + 7, ALARM.y - 7, 2.6, 2.6, RED);
  },

  hotspots: [
    {
      id: 'door',
      label: 'the kitchen',
      verb: 'Go to',
      x: 22,
      y: 96,
      w: 56,
      h: 160,
      approachX: 52,
      async onInteract(g) {
        await g.goTo('kitchen', { x: 785, facing: -1 });
      },
    },
    {
      id: 'plants',
      label: 'dead plants',
      x: 110,
      y: 140,
      w: 240,
      h: 60,
      approachX: 220,
      async onInteract(g) {
        await g.say('Mother’s ferns. Brown and brittle — the ones nearest the pipe went first.');
      },
    },
    {
      id: 'book',
      label: 'glasshouse book',
      verb: 'Read',
      x: 354,
      y: 184,
      w: 44,
      h: 16,
      priority: true,
      async onInteract(g) {
        await g.read('potting_notes');
        await g.say('The ones nearest the hot pipe. The birds. Her headaches.', 'She knew. Nobody listened.');
      },
    },
    {
      id: 'cage',
      label: 'birdcage',
      x: 440,
      y: 66,
      w: 62,
      h: 70,
      approachX: 470,
      async onInteract(g) {
        await g.say('Pip and Moth. Mother’s canaries.', 'Still in the bottom of the cage after twenty-two years. Dry as paper.', 'Miners carried canaries underground. When the bird stopped singing, you got out.');
        g.addClue('canaries');
      },
    },
    {
      id: 'alarm',
      label: (st) => (st.flags.alarmFixed ? 'empty bracket' : 'alarm'),
      x: ALARM.x - 18,
      y: ALARM.y - 18,
      w: 52,
      h: 36,
      approachX: 560,
      enabled: (st) => !st.inventory.includes('co_alarm'),
      async onInteract(g) {
        if (g.flag('alarmFixed')) return;
        await g.say('There. The chirp I’ve heard all night.', 'A carbon-monoxide alarm, cable-tied to the pipe. The light blinks: low battery.');
        await g.read('alarm_label');
        g.addClue('abels_alarm');
        await g.say('Abel put it here. On the pipe from the boiler.', 'If I had a battery — the square kind…');
        if (!g.has('battery')) await g.say('Father kept odds and ends in the attic desk drawer. The back stair goes up to the nursery, and the landing.');
        g.objective('Get the alarm working.');
      },
      async onUse(g, item) {
        if (item !== 'battery') return false;
        g.take('battery');
        g.setFlag('alarmFixed');
        g.sfx('click');
        await g.wait(400);
        g.sfx('alarm');
        g.flash = 0.25;
        await g.wait(600);
        g.sfx('alarm');
        g.audio.pulseTension(0.9, 3500);
        await g.say('The battery from the study drawer. SHUT UP SHUT UP SHUT UP.', 'It shrieks.', 'CO — 190 ppm.', 'Carbon monoxide. In here, on the pipe from the cellar.');
        g.give('co_alarm');
        g.addClue('co_reading');
        g.hud.hint('While you carry the CO alarm its reading shows in the corner. Follow it to the source.', 7000);
        await g.say('I cut it off the pipe and take it with me. It’ll tell me where it’s worst.');
        g.objective('Get into the cellar — the key must be somewhere Mother kept things. Her darkroom?');
        return true;
      },
    },
    {
      id: 'barrow',
      label: 'wheelbarrow',
      x: 636,
      y: 220,
      w: 130,
      h: 40,
      async onInteract(g) {
        await g.say('Mother’s barrow, rusted to the colour of tea.');
      },
    },
  ],
};

