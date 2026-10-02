// Chapter 2 — "Lark Time". Ground floor: kitchen → hall → workshop.
// Puzzles: the answerphone tape (item combination), the regulator (true time), and the
// mirror and the window (observation, under pressure). Ends on Twist 2.

import { kitchen } from './kitchen.js';
import { hall } from './hall.js';
import { workshop, REGULATOR_PUZZLE } from './workshop.js';

export const CHAPTER2_ROOMS = { kitchen, hall, workshop };

export const CHAPTER2_PUZZLES = {
  tape: { kind: 'steps', steps: [] },
  regulator_set: REGULATOR_PUZZLE,
  front_padlock: {
    kind: 'code',
    digits: 4,
    solution: '1403',
    title: 'Abel’s padlock',
    brand: 'SQUIRE · BRASS',
    tag: 'A luggage label tied to the chain, in pencil: “Her birthday. — A.”',
    solvedText: 'The shackle springs.',
    onWrong(code, g) {
      if (!g.story.hasClue('birthday')) return { message: 'Nothing. “Her birthday” — Wren’s. When is Wren’s birthday? Father would have written it down.' };
      return { message: 'Nothing. Day and month, the way Father wrote dates.' };
    },
  },
};

const CHAPTER2_CLUES = ['warm_kettle', 'strangers_tea', 'bootprints', 'phone_note', 'answerphone', 'birthday', 'kitchen_clock', 'workshop_clocks', 'regulator', 'clara_diary', 'two_presences', 'the_boiler'];

export const chapter2 = {
  number: 2,
  title: 'Lark Time',

  async begin(g) {
    g.setFlag('clockBase', g.state.playTime);
    await g.ui.fade(true, 500);
    g.loadRoom('kitchen', 64, 1);
    g.camX = 0;
    await g.titleCard({ eyebrow: 'Chapter Two', title: 'Lark Time', line: 'The kitchen clock says 4:52. It’s lying.' });
    await g.ui.fade(false, 600);
    await g.say(
      'The back stair comes out in the kitchen.',
      'It’s warm down here. The range is lit.',
      'Somebody has been in this kitchen tonight — while I was locked upstairs.',
    );
    g.objective('Find out who A.R. is.');
    g.saveNow();
  },

  async resume(g) {
    // Saved after the twist but before moving on: carry straight on into Chapter 3.
    if (g.flag('ch2_complete')) await g.startChapter(3);
  },

  hooks: {
    async frontDoor(g) {
      g.setFlag('frontDoorOpen');
      g.sfx('window');
      g.audio.setWind(0.9);
      await g.say('The door swings in on wind and rain.', 'The causeway is under the sea. There is nowhere to go until low water.', 'Out on the water, the lantern. Waiting for the tide, like me.');
      return true;
    },
  },

  async end(g) {
    g.setFlag('ch2_complete');
    g.saveNow();
    await g.ui.fade(true, 900);
    const found = CHAPTER2_CLUES.filter((id) => g.story.hasClue(id)).length;
    const screen = g.endScreen({
      variant: 'chapter',
      eyebrow: 'End of Chapter Two',
      title: 'Lark Time',
      paragraphs: [
        'The man with the lantern has been keeping her alive. The thing in the mirror is in the air she breathes.',
        'But Abel’s notes are all to Wren. And Abel thinks Wren is in this house.',
      ],
      stats: [
        ['Clues noted', `${found} of ${CHAPTER2_CLUES.length}`],
        ['Time on the island', g.stats().time],
      ],
      buttons: [
        { label: 'Find the leak — Chapter Three', value: 'next', primary: true },
        { label: 'Return to the menu', value: 'menu' },
      ],
    });
    await g.ui.fade(false, 600);
    const choice = await screen;
    if (choice === 'next') await g.startChapter(3);
    else {
      await g.ui.fade(true, 300);
      g.showMainMenu();
      await g.ui.fade(false, 400);
    }
  },
};
