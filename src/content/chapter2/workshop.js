// Father's workshop. A wall of clocks stopped at 3:17, and the regulator — the only
// honest clock in the house. Chapter 2 puzzle 2 ("The True Clock"): hang its pendulum,
// set it to the TRUE time (the kitchen clock runs 40 minutes fast, in real time), and
// let it strike. The cabinet opens: Mother's diary and her keys.

import { PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { FLOOR, floorboards, wallpaper, skirting, windowFrame, windowSea, doorOpen, clockFace } from '../draw.js';
import { trueMinutes, houseMinutes, fmt } from '../time.js';

const W = 860;
const REG = { x: 566, y: 40, w: 64, h: 216 };
const CAB = { x: 660, y: 92, w: 104, h: 140 };
const WALL_CLOCKS = [
  [130, 70, 16], [176, 92, 12], [222, 66, 20], [270, 96, 14],
  [140, 130, 13], [196, 140, 18], [250, 150, 12], [302, 132, 16],
];

export const workshop = {
  id: 'workshop',
  title: 'The workshop',
  width: W,
  walkY: 304,
  bounds: { min: 46, max: 820 },
  spawnX: 60,
  darkness: 0.8,
  paperSeed: 73,
  ambience: 'attic',
  wind: () => 0.25,
  hazeTarget: () => 0.34,
  coLevel: () => 55,

  lights() {
    return [
      { x: 470, y: 150, r: 190, a: 0.7 },
      { x: 812, y: 140, r: 70, a: 0.25 },
    ];
  },

  drawStatic(pen, st) {
    const fl = st.flags;
    wallpaper(pen, W, 28, 240, { gap: 24, salt: 'ws-wall' });
    pen.begin('ws-ceiling');
    pen.line(0, 28, W, 28, { w: 1.4 });
    pen.hatch(0, 0, W, 28, { gap: 2.6, w: 0.5 });
    skirting(pen, W, 240);
    floorboards(pen, W);
    doorOpen(pen, 30, 98, 50, 158, { salt: 'ws-door', swing: 1 });
    pen.text('hall', 44, 92, { size: 9, font: FONT_TYPE, alpha: 0.7 });

    // A wall of clocks, every one stopped at 3:17.
    WALL_CLOCKS.forEach(([x, y, r], i) => {
      pen.begin(`ws-clock-${i}`);
      pen.fillEllipse(x, y, r + 2, r + 2, PAPER_LIGHT);
      clockFace(pen, x, y, r, 3, 17, { w: 0.9 });
    });

    // Workbench with the lamp, tools, gears and the notebook.
    pen.begin('ws-bench');
    pen.fillRect(352, 200, 196, 7, PAPER_LIGHT);
    pen.rect(352, 200, 196, 7, { w: 1.4 });
    pen.line(358, 207, 358, FLOOR, { w: 1.6 });
    pen.line(542, 207, 542, FLOOR, { w: 1.6 });
    pen.crossHatch(360, 214, 180, 42, { gap: 3, w: 0.5, alpha: 0.6 });
    // Lamp.
    pen.line(470, 200, 476, 150, { w: 1.4 });
    pen.line(476, 150, 448, 130, { w: 1.4 });
    pen.poly([[436, 124], [460, 124], [466, 140], [430, 140]], { closed: true, w: 1.2 });
    // Gears.
    for (const [x, y, r] of [[380, 192, 8], [398, 194, 5], [416, 191, 7]]) {
      pen.circle(x, y, r, { w: 0.9 });
      pen.circle(x, y, 1.6, { w: 0.6 });
    }
    // Notebook.
    pen.fillPoly([[500, 196], [532, 194], [534, 200], [498, 201]], PAPER_LIGHT);
    pen.poly([[500, 196], [532, 194], [534, 200], [498, 201]], { closed: true, w: 0.9 });
    // Pegboard of tools.
    pen.rect(360, 60, 180, 70, { w: 1 });
    for (let i = 0; i < 9; i++) pen.line(372 + i * 19, 70, 372 + i * 19 + (i % 2) * 4, 112, { w: 1.4 });

    // The regulator: tall glass case.
    pen.begin('ws-regulator');
    pen.fillRect(REG.x, REG.y, REG.w, REG.h, PAPER_LIGHT, 0.6);
    pen.rect(REG.x, REG.y, REG.w, REG.h, { w: 1.6 });
    pen.poly([[REG.x - 4, REG.y], [REG.x + REG.w / 2, REG.y - 14], [REG.x + REG.w + 4, REG.y]], { w: 1.3 });
    pen.rect(REG.x + 8, REG.y + 70, REG.w - 16, REG.h - 84, { w: 0.9 });
    pen.text('REGULATOR', REG.x + 4, REG.y + REG.h - 4, { size: 7, font: FONT_TYPE, alpha: 0.8 });

    // Father's cabinet.
    pen.begin('ws-cabinet');
    pen.fillRect(CAB.x, CAB.y, CAB.w, CAB.h, PAPER_LIGHT, 0.7);
    pen.rect(CAB.x, CAB.y, CAB.w, CAB.h, { w: 1.6 });
    pen.line(CAB.x + CAB.w / 2, CAB.y, CAB.x + CAB.w / 2, CAB.y + CAB.h, { w: 1 });
    if (fl.cabinetOpen) {
      pen.line(CAB.x + CAB.w / 2, CAB.y, CAB.x + CAB.w / 2 + 30, CAB.y + 10, { w: 1 });
      pen.line(CAB.x + CAB.w / 2 + 30, CAB.y + 10, CAB.x + CAB.w / 2 + 30, CAB.y + CAB.h - 10, { w: 1 });
    } else {
      pen.hatch(CAB.x + 4, CAB.y + 4, CAB.w - 8, CAB.h - 8, { gap: 4, w: 0.4, alpha: 0.4 });
    }
    pen.line(CAB.x + 8, CAB.y + 50, CAB.x + CAB.w - 8, CAB.y + 50, { w: 0.8 });
    pen.line(CAB.x + 8, CAB.y + 96, CAB.x + CAB.w - 8, CAB.y + 96, { w: 0.8 });
    if (!fl.diaryTaken) {
      pen.fillRect(CAB.x + 16, CAB.y + 30, 26, 20, PAPER_LIGHT);
      pen.rect(CAB.x + 16, CAB.y + 30, 26, 20, { w: 1 });
    }
    pen.rect(CAB.x + CAB.w / 2 - 6, CAB.y + CAB.h + 4, 12, 6, { w: 0.9 });
    pen.text('opens at the stroke', CAB.x + 4, CAB.y + CAB.h + 20, { size: 8, font: FONT_TYPE, alpha: 0.8 });

    windowFrame(pen, 790, 96, 44, 84, { salt: 'ws-window', mullions: false });
  },

  drawDynamic(pen, st, t) {
    windowSea(pen, 790, 96, 44, 84, t, { lantern: 0, salt: 'ws-sea', dawn: st.chapter === 4 ? 0.7 : 0 });
    // Regulator face and pendulum (swinging once restored).
    pen.begin('ws-reg-dyn');
    const fl = st.flags;
    const shown = fl.regulatorSet ? trueMinutes(st) : 3 * 60 + 17;
    clockFace(pen, REG.x + REG.w / 2, REG.y + 34, 22, Math.floor(shown / 60), shown % 60, { w: 1.1 });
    if (fl.regulatorPendulum) {
      const a = Math.sin(t * Math.PI) * 0.12;
      const px = REG.x + REG.w / 2;
      const py = REG.y + 72;
      const bx = px + Math.sin(a) * 100;
      const by = py + Math.cos(a) * 100;
      pen.line(px, py, bx, by, { w: 1.2 });
      pen.fillEllipse(bx, by, 9, 9, PAPER_LIGHT);
      pen.circle(bx, by, 9, { w: 1.3 });
    }
  },

  hotspots: [
    {
      id: 'hall',
      label: 'the hall',
      verb: 'Go to',
      x: 28,
      y: 96,
      w: 56,
      h: 160,
      approachX: 56,
      async onInteract(g) {
        await g.goTo('hall', { x: 940, facing: -1 });
      },
    },
    {
      id: 'clocks',
      label: 'wall of clocks',
      x: 108,
      y: 46,
      w: 216,
      h: 124,
      approachX: 220,
      async onInteract(g) {
        await g.say('Every clock on the wall stopped at 3:17. Father did it himself, one after another, the week after the fire.', 'All of them lying by the same forty minutes.');
        g.addClue('workshop_clocks');
      },
    },
    {
      id: 'notebook',
      label: 'notebook',
      verb: 'Read',
      x: 494,
      y: 186,
      w: 44,
      h: 18,
      priority: true,
      async onInteract(g) {
        await g.read('workshop_notes');
        g.setFlag('notesRead');
        await g.say('The regulator keeps the truth. Set it true, let it strike, and the cabinet opens.', 'And its pendulum is holding a cupboard door open in the hall.');
        g.objective(g.flag('regulatorPendulum') ? 'Set the regulator to the TRUE time.' : 'Find the regulator’s pendulum (the hall cupboard), then set it to the TRUE time.');
      },
    },
    {
      id: 'bench',
      label: 'workbench',
      x: 352,
      y: 120,
      w: 196,
      h: 88,
      approachX: 430,
      async onInteract(g) {
        await g.say('His bench. Loupes, tweezers, a jar of tiny screws, a cup with a ring of dried tea in it.', 'He sat here every day for twenty-two years with the door shut.');
      },
    },
    {
      id: 'regulator',
      label: 'regulator',
      verb: (st) => (st.flags.regulatorPendulum && !st.flags.regulatorSet ? 'Set' : 'Inspect'),
      x: REG.x - 4,
      y: REG.y - 14,
      w: REG.w + 8,
      h: REG.h + 14,
      async onInteract(g) {
        if (g.flag('regulatorSet')) {
          await g.say(`Ticking. ${fmt(trueMinutes(g.state))}. The truth, for once.`);
          return;
        }
        if (!g.flag('regulatorPendulum')) {
          await g.say('The regulator. Glass case, brass works — and no pendulum. The hook is empty.', 'Its hands say 3:17, like all the rest.');
          return;
        }
        const ok = await g.puzzles.openCodeLock('regulator_set');
        if (ok) await strike(g);
      },
      async onUse(g, item) {
        if (item !== 'pendulum') return false;
        g.take('pendulum');
        g.setFlag('regulatorPendulum');
        g.sfx('tick');
        await g.say('I hang the bob on its hook and give it a nudge.', 'Tick. Tock. It’s going. The hands still say 3:17.', 'It needs setting. To the true time — not the house’s.');
        g.objective('Set the regulator to the TRUE time.');
        return true;
      },
    },
    {
      id: 'cabinet',
      label: 'cabinet',
      verb: (st) => (st.flags.cabinetOpen ? 'Search' : 'Try'),
      x: CAB.x,
      y: CAB.y,
      w: CAB.w,
      h: CAB.h + 24,
      async onInteract(g) {
        if (!g.flag('cabinetOpen')) {
          g.sfx('locked');
          await g.say('Glass-fronted, and latched from the inside. A brass plate: OPENS AT THE STROKE.', 'There’s a book on the top shelf. Mother’s handwriting on the spine.');
          return;
        }
        if (!g.flag('diaryTaken')) {
          g.setFlag('diaryTaken');
          g.give('mothers_keys');
          await g.say('Mother’s diary. Father kept it locked up with his best tools.', 'And her little ring of keys: darkroom, glasshouse.');
          await g.read('clara_diary');
          g.addClue('clara_diary');
          g.setFlag('diaryRead');
          g.sfx('knock', { volume: 1.2 });
          await g.wait(700);
          g.sfx('knock', { volume: 0.8, pan: -0.5 });
          await g.say('…The radiators. All through the house.', '“He only comes when the radiators knock.”', 'The hall mirror. I don’t want to go out there.');
          g.objective('Face whatever is in the hall mirror. Look out of the window too.');
          return;
        }
        await g.read('clara_diary');
      },
    },
    {
      id: 'window',
      label: 'window',
      x: 784,
      y: 90,
      w: 56,
      h: 96,
      async onInteract(g) {
        await g.say('A slit of sea and rain. The workshop was always the darkest room.');
      },
    },
  ],
};

async function strike(g) {
  g.setFlag('regulatorSet');
  g.sfx('chime', { count: 3 });
  g.audio.pulseTension(0.5, 3000);
  await g.wait(1500);
  g.sfx('unlock');
  g.setFlag('cabinetOpen');
  g.addClue('regulator');
  await g.say(`It strikes — and across the room the cabinet latch drops with a click.`, 'Father built a lock that only opens for the truth.');
  g.objective('Search Father’s cabinet.');
}

/** The regulator_set code lock: HHMM in TRUE time, give or take a few minutes of fumbling. */
export const REGULATOR_PUZZLE = {
  kind: 'code',
  digits: 4,
  title: 'Set the regulator',
  brand: 'REGULATOR · TRUE TIME · HH MM',
  variant: 'dial',
  tryLabel: 'Set the hands',
  tag: 'Set me to the truth, and I’ll strike. — E.',
  solvedText: 'The hands settle. It begins to strike.',
  solution(code, g) {
    const entered = Number(code.slice(0, 2)) * 60 + Number(code.slice(2));
    const truth = trueMinutes(g.state);
    return Math.abs(entered - truth) <= 3 || Math.abs(entered + 720 - truth) <= 3;
  },
  onWrong(code, g) {
    const entered = Number(code.slice(0, 2)) * 60 + Number(code.slice(2));
    const house = houseMinutes(g.state);
    if (Math.abs(entered - house) <= 3 || Math.abs(entered + 720 - house) <= 3) {
      return { message: 'It ticks on, sulking. That’s the kitchen clock’s time.', red: 'Lark time. It wants the TRUTH.', redId: 'lark' };
    }
    if (code === '0317' || code === '0237') return { message: 'That’s the minute of the fire, not the minute now.' };
    return { message: 'It ticks on, sulking. What time is it really?' };
  },
  redNotes: [{ id: 'lark', text: 'Lark time. It wants the TRUTH.' }],
};

