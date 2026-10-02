// Chapter 4 — "Low Water". Dawn. The back stair → the nursery → the front door → the
// causeway. Puzzles: reconstruct the fire by true time (ordering), sign the journal
// (choice), and cross at TRUE low water — the house clocks will drown you.

import { backstair, FIRE_ROUTE_PUZZLE } from './backstair.js';
import { causeway } from './causeway.js';
import { sketchDaylight, sketchNightFive } from './data.js';
import { houseMinutes, trueMinutes, fmt, LOW_WATER } from '../time.js';
import { CLUES } from '../clues.js';
import { CLUES2 } from '../chapter2/data.js';
import { CLUES3 } from '../chapter3/data.js';
import { CLUES4 } from './data.js';

export const CHAPTER4_ROOMS = { backstair, causeway };
export const CHAPTER4_PUZZLES = { fire_route: FIRE_ROUTE_PUZZLE };

const DAWN_HOUSE_TIME = 6 * 60; // the house clocks say 6:00 when she comes up from the cellar
const TOTAL_CLUES = Object.keys({ ...CLUES, ...CLUES2, ...CLUES3, ...CLUES4 }).length;

/** Evidence that lets her write her own name. Four of these is enough. */
const IDENTITY_CLUES = ['red_pen', 'headboard', 'height_marks', 'birthday', 'feb_photos', 'inquest', 'fire_route', 'abel_note'];

export const chapter4 = {
  number: 4,
  title: 'Low Water',

  async begin(g) {
    g.setFlag('dawnClock', DAWN_HOUSE_TIME);
    await g.ui.fade(true, 500);
    g.loadRoom('hall', 815, -1);
    await g.titleCard({ eyebrow: 'Chapter Four', title: 'Low Water', line: '6:00 a.m. by the house clocks.' });
    await g.ui.fade(false, 800);
    await g.say(
      'I sat on the cellar steps until the window at the top went grey.',
      'The house is cold now. Quiet. My head is clear for the first time in days.',
      'The fire came up the back stair. The way Maren went back in.',
    );
    g.objective('Walk the back stair, the way the fire went. (Through the kitchen.)');
    g.saveNow();
  },

  async resume() {},

  /** Entering the nursery after the stair: the final revelation. */
  async onRoomEnter(g, roomId) {
    if (roomId !== 'nursery' || !g.puzzles.isSolved('fire_route') || g.flag('signed')) return;
    await revelation(g);
  },

  hooks: {
    frontDoor: crossing,
    drown,
    reachAbel,
  },
};

async function revelation(g) {
  g.audio.setTension(0.3);
  if (!g.flag('revealed')) await revealIdentity(g);
  await signThePage(g);
}

async function revealIdentity(g) {
  await g.say('Our room. Grey light on the beds.', 'The first page of the journal. I always skip it. I’ve never once looked at it properly.');
  await g.read('first_page');
  g.addClue('first_page');
  await g.say(
    'Maren drew. Wren corrected her — in red.',
    'The red pen in my pocket with its cap chewed flat.',
    'The window bed with WREN carved in it, that I drew as mine.',
    'No height mark in 2005 — the year I was sent to Aunt Hester’s.',
    'Father’s calendar: W., thirty-one. Abel’s notes, every one of them to Wren.',
    '“She keeps saying she has to find Wren.”',
  );
  g.sfx('heartbeat');
  await g.say('I’m not looking for Wren.', g.red('I’m Wren.'));
  g.addClue('i_am_wren');
  g.setFlag('revealed');
}

async function signThePage(g) {
  const evidence = IDENTITY_CLUES.filter((id) => g.story.hasClue(id)).length;
  const ready = evidence >= 4;
  const choice = await g.choose({
    title: 'The last page',
    text: ['The journal is open on my knee. The pen in my hand is red.', 'Whose name goes at the bottom of the page?'],
    options: [
      {
        label: 'Sign it: Wren',
        value: 'wren',
        red: true,
        disabled: !ready,
        note: ready ? null : 'I can’t. Not yet. I need to be sure — there’s more in this house that knows who I am.',
      },
      { label: 'Sign it: Maren', value: 'maren', note: 'Keep her alive a little longer.' },
      ...(ready ? [] : [{ label: 'Not yet — look around first', value: 'later' }]),
    ],
  });
  if (choice === 'later') {
    g.objective('Find what proves who I am. Then sign the journal (the nursery).');
    return;
  }
  if (choice === 'maren') {
    await loopEnding(g);
    return;
  }
  g.setFlag('signed', 'wren');
  g.sfx('pen');
  g.annotate('nursery', { id: 'mine', type: 'text', text: 'mine.', x: 452, y: 182, size: 20, rot: -0.1 });
  g.addEntry('wren');
  await g.openJournal('wren');
  await g.say('Wren Lark. In red. My own hand.', 'Abel said he’d come at low water.', 'Low water. The tide table. TRUE time.');
  g.objective('Leave by the front door (back stair → kitchen → hall) at low water — by TRUE time, not the house clocks.');
}

async function crossing(g) {
  if (g.state.flags.signed !== 'wren') {
    await g.say('Not yet.', 'I can’t walk out of this house as someone I’m not.');
    return true;
  }
  g.setFlag('frontDoorOpen');
  g.audio.setWind(0.9);
  for (;;) {
    const house = houseMinutes(g.state);
    const choice = await g.choose({
      title: 'The front door',
      text: [
        `Grey light, cold air, the sea. The house clocks say **${fmt(house)}**.`,
        'Father’s tide table: low water **7:49** — safe two hours either side.',
      ],
      options: [
        { label: 'Set out across the causeway now', value: 'go', red: true },
        { label: 'Wait ten minutes', value: 'wait' },
        { label: 'Read the tide table again', value: 'table' },
        { label: 'Step back inside', value: 'back' },
      ],
      cancel: 'back',
    });
    if (choice === 'back') return true;
    if (choice === 'table') {
      await g.read('tide_table');
      continue;
    }
    if (choice === 'wait') {
      g.setFlag('dawnClock', house + 10);
      g.sfx('tick');
      continue;
    }
    // Save the moment before she steps out, so a drowning can be undone.
    g.saveNow();
    g.setFlag('crossTrue', trueMinutes(g.state));
    await g.goTo('causeway', { x: 80, facing: 1 });
    return true;
  }
}

async function drown(g) {
  g.sfx('waves');
  g.flickerTorch(1);
  await g.say('It’s at my knees. My thighs. The stones have gone.', 'The clocks said there was time. The clocks always say there was time.');
  g.scare({ shake: 0.8 });
  const early = LOW_WATER - 120 - (g.state.flags.crossTrue ?? 0);
  await g.gameOver({
    title: 'High Water',
    paragraphs: [
      'The house clocks run forty minutes fast. The tide table is printed in true time.',
      early > 0 ? `She set out ${early} minutes before the causeway was safe.` : 'She set out after the causeway had gone back under.',
      '[[Lark time. Better early on the causeway than late — unless you are reading Father’s clocks.]]',
    ],
  });
}

async function reachAbel(g) {
  g.audio.setTension(0);
  await g.say({ text: 'Wren.', speaker: 'Abel' }, 'He says it like it’s the most ordinary word in the world.', 'Abel.');
  await g.say(
    { text: 'You’re cold. You turned it off — the boiler?', speaker: 'Abel' },
    'I turned it off.',
    { text: 'Good girl. The doctor’s on the eight o’clock boat. You’re coming to mine and you’re sleeping in a room with the window open.', speaker: 'Abel' },
    { text: 'She got your dad to the bottom of the stair, you know. Your sister. Your dad made me promise never to tell you how close she came.', speaker: 'Abel' },
    { text: 'It wasn’t your candle, love. It was never your candle.', speaker: 'Abel' },
    'I know.',
  );
  await g.say('I look back at the house once.', 'In the nursery window — just for a second — someone small. Waving.', 'Someone thirteen.');
  const found = g.state.clues.length;
  g.setFlag('ending', 'wren');
  await g.ui.fade(true, 1200);
  const screen = g.endScreen({
    variant: 'ending',
    eyebrow: 'The end',
    title: 'Wren',
    sketch: { draw: sketchDaylight, w: 380, h: 260, label: 'Wexley House from the causeway in daylight. A small figure waves from the nursery window.' },
    paragraphs: [
      'The journal is redrawn one last time, in daylight, with no hatching anywhere.',
      'Nobody drew the girl in the window.',
    ],
    stats: [
      ['Clues noted', `${found} of ${TOTAL_CLUES}`],
      ['Time on the island', g.stats().time],
    ],
    buttons: [{ label: 'Return to the menu', value: 'menu', primary: true }],
  });
  await g.ui.fade(false, 800);
  await screen;
  await g.ui.fade(true, 400);
  g.showMainMenu();
  await g.ui.fade(false, 500);
}

async function loopEnding(g) {
  g.setFlag('ending', 'maren');
  g.sfx('pen');
  g.addEntry('night_5', { silent: true });
  await g.say('Maren. In black.', 'The page turns by itself.');
  await g.ui.fade(true, 1000);
  const screen = g.endScreen({
    variant: 'gameover',
    eyebrow: 'An ending',
    title: 'Night Five',
    sketch: { draw: sketchNightFive, w: 380, h: 200, label: 'The same first line written five times, four crossed out in red, and five tally marks.' },
    paragraphs: [
      'Came over on the last ferry. Wren isn’t here. Her case is.',
      'The boiler is cold, and the window is open. But the woman in the attic is still looking for her sister.',
      '[[There is another way to sign the page.]]',
    ],
    buttons: [
      { label: 'Turn back the page', value: 'retry', primary: true },
      { label: 'Return to the menu', value: 'menu' },
    ],
  });
  await g.ui.fade(false, 800);
  const choice = await screen;
  if (choice === 'retry') {
    g.setFlag('ending', false);
    await revelation(g);
    return;
  }
  await g.ui.fade(true, 400);
  g.showMainMenu();
  await g.ui.fade(false, 500);
}
