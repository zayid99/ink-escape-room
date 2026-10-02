// The hall: front door, mirror, the window onto the causeway, and every door that
// matters — workshop, darkroom, cellar. Twist 2 happens in front of the mirror.

import { PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowSea, doorClosed, doorOpen } from '../draw.js';
import { trueMinutes, causewayExposure } from '../time.js';

const W = 1000;
const WIN = { x: 412, y: 78, w: 104, h: 110 };
const MIRROR = { x: 294, y: 70, w: 72, h: 162 };

export const hall = {
  id: 'hall',
  title: 'The hall',
  width: W,
  walkY: 304,
  bounds: { min: 46, max: 970 },
  spawnX: 60,
  darkness: 0.86,
  paperSeed: 61,
  ambience: 'attic',
  wind: (st) => (st.flags.frontDoorOpen ? 0.9 : 0.4),
  hazeTarget: () => 0.4,
  coLevel: (x) => 60 + 70 * Math.exp(-(((x - 815) / 70) ** 2)),

  lights(st) {
    const dawn = st.chapter === 4;
    return [
      { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2, r: dawn ? 200 : 100, a: dawn ? 0.6 : 0.3 },
      { x: 56, y: 190, r: 80, a: 0.25 },
      ...(st.flags.frontDoorOpen ? [{ x: 590, y: 180, r: 160, a: dawn ? 0.7 : 0.35 }] : []),
    ];
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    wallpaper(pen, W, 30, 200, { gap: 18, salt: 'hall-wall' });
    pen.begin('hall-rails');
    pen.line(0, 30, W, 30, { w: 1.4 });
    pen.hatch(0, 0, W, 30, { gap: 2.8, w: 0.5 });
    pen.line(0, 200, W, 200, { w: 1 });
    for (let x = 10; x < W - 40; x += 64) pen.rect(x, 208, 52, 26, { w: 0.6, alpha: 0.7 });
    skirting(pen, W, 240);
    floorboards(pen, W);
    // Tiled floor pattern near the door.
    pen.begin('hall-tiles');
    for (let i = 0; i < 8; i++) pen.line(470 + i * 30, 262, 440 + i * 36, 340, { w: 0.5, alpha: 0.5, passes: 1 });

    doorOpen(pen, 30, 98, 50, 158, { salt: 'hall-kitchen', swing: 1 });
    pen.text('kitchen', 30, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Coat stand.
    pen.begin('hall-coats');
    pen.line(140, 90, 140, FLOOR, { w: 1.8 });
    pen.line(124, FLOOR, 156, FLOOR, { w: 1.6 });
    pen.poly([[132, 96], [148, 96], [154, 170], [126, 170]], { closed: true, w: 1.1 });
    pen.hatch(126, 96, 28, 74, { gap: 2.6, w: 0.5 });
    pen.line(140, 90, 128, 84, { w: 1 });
    pen.line(140, 90, 152, 84, { w: 1 });

    // Cupboard, propped open (by the pendulum bob, until she takes it).
    pen.begin('hall-cupboard');
    if (fl.pendulumTaken) doorClosed(pen, 196, 120, 46, 136, { salt: 'hall-cupboard-door', knobSide: 1 });
    else {
      doorOpen(pen, 196, 120, 46, 136, { salt: 'hall-cupboard-door', swing: 1 });
      pen.fillEllipse(254, 250, 7, 6, PAPER_LIGHT);
      pen.ellipse(254, 250, 7, 6, { w: 1.2 });
      pen.line(254, 244, 262, 226, { w: 1.2 });
    }

    // Mirror frame (glass is dynamic).
    pen.begin('hall-mirror');
    pen.rect(MIRROR.x - 8, MIRROR.y - 8, MIRROR.w + 16, MIRROR.h + 16, { w: 1.8 });
    pen.rect(MIRROR.x - 3, MIRROR.y - 3, MIRROR.w + 6, MIRROR.h + 6, { w: 0.8 });
    pen.line(MIRROR.x + MIRROR.w / 2, MIRROR.y - 8, MIRROR.x + MIRROR.w / 2, MIRROR.y - 20, { w: 0.6 });

    windowFrame(pen, WIN.x, WIN.y, WIN.w, WIN.h, { salt: 'hall-window' });
    // Radiator under the window.
    pen.begin('hall-radiator');
    pen.rect(424, 214, 80, 32, { w: 1.2 });
    for (let i = 1; i < 8; i++) pen.line(424 + i * 10, 216, 424 + i * 10, 244, { w: 0.7 });

    // Front door with Abel's chain and padlock.
    if (fl.frontDoorOpen) {
      doorOpen(pen, 560, 90, 62, 166, { salt: 'hall-front', swing: -1 });
    } else {
      doorClosed(pen, 560, 90, 62, 166, { salt: 'hall-front', knobSide: -1 });
      pen.begin('hall-chain');
      for (let i = 0; i < 6; i++) pen.ellipse(574 + i * 7, 170 + Math.sin(i) * 2, 4, 2.4, { w: 0.9, steps: 10 });
      pen.fillRect(612, 168, 10, 12, PAPER_LIGHT);
      pen.rect(612, 168, 10, 12, { w: 1.1 });
    }
    pen.text('front door', 566, 84, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Stairs up to the (gated) landing.
    pen.begin('hall-stairs');
    for (let i = 0; i < 9; i++) {
      const x = 660 + i * 12;
      const y = FLOOR - i * 17;
      pen.line(x, y, x + 12, y, { w: 1 });
      pen.line(x + 12, y, x + 12, y - 17, { w: 1 });
    }
    pen.line(660, FLOOR - 20, 768, FLOOR - 170, { w: 1.4 });
    pen.line(668, FLOOR - 60, 668, FLOOR - 20, { w: 1 });

    // Cellar door, chained, chalked NEVER.
    pen.begin('hall-cellar');
    if (fl.cellarOpen) doorOpen(pen, 790, 110, 52, 146, { salt: 'hall-cellar-door', swing: 1 });
    else {
      doorClosed(pen, 790, 110, 52, 146, { salt: 'hall-cellar-door', knobSide: 1 });
      for (let i = 0; i < 7; i++) pen.ellipse(796 + i * 6.5, 186 + (i % 2) * 2, 3.6, 2.2, { w: 0.9, steps: 10 });
      pen.text('NEVER', 798, 140, { size: 12, font: FONT_TYPE, col: PAPER_LIGHT });
    }
    pen.text('cellar', 800, 104, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Darkroom door (under the stairs).
    if (fl.darkroomOpen) doorOpen(pen, 856, 130, 44, 126, { salt: 'hall-dark', swing: 1 });
    else doorClosed(pen, 856, 130, 44, 126, { salt: 'hall-dark', knobSide: 1 });
    pen.text('darkroom', 852, 124, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // Workshop door.
    if (fl.workshopOpen) doorOpen(pen, 920, 98, 50, 158, { salt: 'hall-workshop', swing: -1 });
    else doorClosed(pen, 920, 98, 50, 158, { salt: 'hall-workshop', knobSide: -1 });
    pen.text('workshop', 922, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });
  },

  drawDynamic(pen, st, t) {
    const dawn = st.chapter === 4 ? 0.75 : 0;
    windowSea(pen, WIN.x, WIN.y, WIN.w, WIN.h, t, {
      dawn,
      exposure: causewayExposure(trueMinutes(st)),
      lantern: st.chapter === 4 ? 0 : 1,
      lanternX: 0.72,
      salt: 'hall-sea',
    });
    pen.begin('hall-mullions');
    pen.line(WIN.x + WIN.w / 2, WIN.y, WIN.x + WIN.w / 2, WIN.y + WIN.h, { w: 1.3 });
    pen.line(WIN.x, WIN.y + WIN.h * 0.48, WIN.x + WIN.w, WIN.y + WIN.h * 0.48, { w: 1.3 });
    // The mirror: dark glass with a faint reflection of the window.
    pen.begin('hall-glass');
    pen.fillRect(MIRROR.x, MIRROR.y, MIRROR.w, MIRROR.h, 'rgba(31,27,26,0.62)');
    pen.hatch(MIRROR.x, MIRROR.y, MIRROR.w, MIRROR.h, { gap: 3, dir: -1, w: 0.5, alpha: 0.6 });
    pen.line(MIRROR.x + 10, MIRROR.y + 20, MIRROR.x + 30, MIRROR.y + 4, { w: 0.8, col: PAPER_LIGHT, alpha: 0.35 });
    // Open front door: the sea, framed.
    if (st.flags.frontDoorOpen) {
      windowSea(pen, 566, 96, 50, 160, t, { dawn, exposure: causewayExposure(trueMinutes(st)), lantern: 0, salt: 'hall-door-sea' });
    }
  },

  hotspots: [
    {
      id: 'kitchen',
      label: 'the kitchen',
      verb: 'Go to',
      x: 28,
      y: 96,
      w: 56,
      h: 160,
      approachX: 56,
      async onInteract(g) {
        await g.goTo('kitchen', { x: 862, facing: -1 });
      },
    },
    {
      id: 'coats',
      label: 'coat stand',
      x: 118,
      y: 82,
      w: 44,
      h: 174,
      async onInteract(g) {
        await g.say('Father’s coat. Pipe smoke and brass polish.', 'And a hook where something heavy used to hang. A lantern, maybe.');
      },
    },
    {
      id: 'pendulum',
      label: 'brass weight',
      verb: 'Take',
      x: 240,
      y: 220,
      w: 28,
      h: 38,
      priority: true,
      enabled: (st) => !st.flags.pendulumTaken,
      async onInteract(g) {
        g.setFlag('pendulumTaken');
        g.give('pendulum');
        await g.say('Something heavy holding the cupboard door open.', 'It’s a pendulum bob — brass, on a rod. E.L. stamped on the back.');
      },
    },
    {
      id: 'mirror',
      label: 'mirror',
      x: MIRROR.x - 8,
      y: MIRROR.y - 8,
      w: MIRROR.w + 16,
      h: MIRROR.h + 16,
      async onInteract(g) {
        if (g.state.chapter === 4) {
          await g.say('Just me. Hollow-eyed, hair wild, thirty-one years old.', 'Nobody standing behind me.');
          return;
        }
        if (g.flag('twist2')) {
          await g.say('Just me in the glass now. Just me.');
          return;
        }
        await g.say('Mother’s hall mirror. Too dark to see much in it.', 'I don’t like turning my back on it.');
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
          await g.say(exp >= 1 ? 'The causeway stands clear of the water, every stone of it.' : exp > 0 ? 'The stones are coming up out of the sea. The far end is still under.' : 'The sea is still over the causeway. Not yet.');
          return;
        }
        if (g.phantom.visible && g.flag('diaryRead') && !g.flag('twist2')) {
          await twist2(g);
          return;
        }
        await g.say('Far out on the causeway, the lantern. Swinging, slowly, like someone holding it up to look at the house.');
        if (g.flag('mirrorSeen') && !g.flag('twist2')) await g.say('If I could see him in the glass and look out here at the same time…');
      },
    },
    {
      id: 'front_door',
      label: 'front door',
      verb: (st) => (st.flags.frontDoorOpen ? 'Go out of' : 'Try'),
      x: 556,
      y: 84,
      w: 70,
      h: 172,
      approachX: 590,
      async onInteract(g) {
        if (!g.puzzles.isSolved('front_padlock')) {
          if (!g.flag('frontSeen')) {
            g.setFlag('frontSeen');
            await g.say('The front door. A chain across it, and a brass padlock — new, like the one on the stair gate.', 'Four wheels.');
          }
          const ok = await g.puzzles.openCodeLock('front_padlock');
          if (!ok) return;
          await g.say('It opens.');
        }
        await g.chapterHook('frontDoor');
      },
    },
    {
      id: 'stairs',
      label: 'stairs up',
      x: 656,
      y: 80,
      w: 116,
      h: 176,
      approachX: 700,
      async onInteract(g) {
        await g.say('Up to the landing — and the gate I couldn’t open from the other side.', 'Same new padlock. I’ll use the back stair.');
      },
    },
    {
      id: 'cellar',
      label: (st) => (st.flags.cellarOpen ? 'the cellar' : 'cellar door'),
      verb: (st) => (st.flags.cellarOpen ? 'Go down to' : 'Try'),
      x: 786,
      y: 104,
      w: 60,
      h: 152,
      approachX: 815,
      async onInteract(g) {
        if (g.flag('cellarOpen')) {
          await g.goTo('cellar', { x: 70, facing: 1 });
          return;
        }
        if (g.has('cellar_key')) {
          g.sfx('unlock');
          g.take('cellar_key');
          g.setFlag('cellarOpen');
          await g.say('The chain comes away. The air that comes up the steps is warm, and wrong.');
          await g.goTo('cellar', { x: 70, facing: 1 });
          return;
        }
        g.sfx('locked');
        await g.say('The cellar. Chained, and Father’s own padlock on the chain.', 'NEVER, in chalk, in his capitals.', 'Underneath, scratched into the paint by a child: a dragon.');
        if (g.state.chapter >= 3) await g.say('None of Father’s keys fit. Mother had a key for everything once.');
      },
    },
    {
      id: 'darkroom',
      label: (st) => (st.flags.darkroomOpen ? 'the darkroom' : 'darkroom door'),
      verb: (st) => (st.flags.darkroomOpen ? 'Go to' : 'Try'),
      x: 852,
      y: 124,
      w: 52,
      h: 132,
      approachX: 878,
      async onInteract(g) {
        if (g.flag('darkroomOpen')) {
          await g.goTo('darkroom', { x: 60, facing: 1 });
          return;
        }
        if (g.has('mothers_keys')) {
          g.sfx('unlock');
          g.setFlag('darkroomOpen');
          await g.say('Mother’s darkroom key. It turns as if she used it yesterday.');
          await g.goTo('darkroom', { x: 60, facing: 1 });
          return;
        }
        g.sfx('locked');
        await g.say('Mother’s darkroom, under the stairs. Locked. Not one of Father’s keys.');
      },
    },
    {
      id: 'workshop',
      label: (st) => (st.flags.workshopOpen ? 'the workshop' : 'workshop door'),
      verb: (st) => (st.flags.workshopOpen ? 'Go to' : 'Try'),
      x: 916,
      y: 96,
      w: 58,
      h: 160,
      approachX: 940,
      async onInteract(g) {
        if (g.flag('workshopOpen')) {
          await g.goTo('workshop', { x: 60, facing: 1 });
          return;
        }
        if (g.has('fathers_keys')) {
          g.sfx('unlock');
          g.setFlag('workshopOpen');
          await g.say('WORKSHOP. The key turns.');
          await g.goTo('workshop', { x: 60, facing: 1 });
          return;
        }
        g.sfx('locked');
        await g.say('Father’s workshop. Locked. He never let anyone in without him.');
      },
    },
  ],

  /** After Mother's diary: the radiators knock, and he stands in the mirror. */
  onUpdate(g, dt) {
    const st = g.state;
    if (st.chapter !== 2 || !st.flags.diaryRead || st.flags.twist2) return;
    if (g.phantom.active || g.busy || g.ui.blocking()) return;
    const timers = g.roomTimers;
    timers.mirror = (timers.mirror || 0) + dt;
    if (timers.mirror < 3) return;
    timers.mirror = -8;
    g.sfx('knock', { pan: -0.2 });
    g.phantom.summon({
      x: MIRROR.x + MIRROR.w / 2,
      footY: MIRROR.y + MIRROR.h - 4,
      height: 128,
      delay: 0.8,
      linger: 16,
      onCaught: () => {
        g.scare({ shake: 0.3 });
        if (!g.flag('mirrorSeen')) {
          g.setFlag('mirrorSeen');
          g.ambient(async () => {
            await g.say('In the glass. Behind me. Gone when I turn.', 'He’s always behind me. If I could see him there and look out of the window at the same time…');
          });
        }
      },
    });
  },
};

/** Twist 2: the tall man and Abel are not the same — and the house is poisoning her. */
async function twist2(g) {
  g.audio.setTension(0.6);
  await g.say(
    'In the mirror, behind me — tall, very still. I can see him at the edge of my eye.',
    'And out there, through the window: the lantern. Far out on the causeway. Swinging.',
    'He can’t be both.',
  );
  g.phantom.clear();
  g.sfx('heartbeat');
  g.addClue('two_presences');
  await g.say(
    'Whatever stands behind me isn’t Abel. Abel’s out on the water, waiting for the tide.',
    'Mother saw it in 2004. Maren drew it. Father’s head was “like a drum”. The canaries died.',
    'And it only comes when the radiators knock.',
    'Father never ran the heating. The radiators are hot.',
  );
  g.addEntry('night_1', { silent: true });
  await g.openJournal('night_1');
  await g.say(g.red('“It’s freezing — I got the boiler going.”'), 'My first night. My handwriting.', 'It isn’t a ghost. It’s the boiler. It’s in the air — in my head — the way it was in all of theirs.', 'And Abel has been opening the windows.');
  g.addClue('the_boiler');
  g.addEntry('night_4');
  g.setFlag('twist2');
  g.audio.setTension(0.1);
  await g.chapterEnd();
}

