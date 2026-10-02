// Chapter 3 — "Exposure". Glasshouse → darkroom → cellar.
// Puzzles: revive Abel's CO alarm (item use, then a hot/cold search), develop Mother's
// film (ordering, in the dark), shut the boiler down (ordering). Ends on Twist 3.

import { greenhouse } from './greenhouse.js';
import { darkroom, DEVELOP_PUZZLE } from './darkroom.js';
import { cellar, SHUTDOWN_PUZZLE } from './cellar.js';
import { chapter2 } from '../chapter2/index.js';

export const CHAPTER3_ROOMS = { greenhouse, darkroom, cellar };

export const CHAPTER3_PUZZLES = {
  develop_film: DEVELOP_PUZZLE,
  boiler_shutdown: SHUTDOWN_PUZZLE,
};

const CHAPTER3_CLUES = ['abels_alarm', 'co_reading', 'canaries', 'feb_photos', 'cellar_key', 'the_crack', 'shut_down', 'inquest'];

export const chapter3 = {
  number: 3,
  title: 'Exposure',

  async begin(g) {
    await g.titleCard({ eyebrow: 'Chapter Three', title: 'Exposure', line: 'The radiators have stopped knocking. For now.' });
    await g.say(
      'The boiler is in the cellar. The cellar is chained, and Father’s keys don’t fit it.',
      'Mother’s keys: the darkroom, the glasshouse.',
      'And something in this house has been chirping at me all night.',
    );
    g.objective('Find the leak. Try Mother’s glasshouse (off the kitchen) and her darkroom (the hall).');
    g.saveNow();
  },

  async resume(g) {
    if (g.flag('ch3_complete')) await g.startChapter(4);
  },

  hooks: { frontDoor: (g) => chapter2.hooks.frontDoor(g) },

  async end(g) {
    g.setFlag('ch3_complete');
    g.saveNow();
    await g.ui.fade(true, 900);
    const found = CHAPTER3_CLUES.filter((id) => g.story.hasClue(id)).length;
    const screen = g.endScreen({
      variant: 'chapter',
      eyebrow: 'End of Chapter Three',
      title: 'Exposure',
      paragraphs: [
        'The boiler is cold. The air is clearing. The house is only a house.',
        'And the sister who died in it was Maren.',
      ],
      stats: [
        ['Clues noted', `${found} of ${CHAPTER3_CLUES.length}`],
        ['Time on the island', g.stats().time],
      ],
      buttons: [
        { label: 'Low water — Chapter Four', value: 'next', primary: true },
        { label: 'Return to the menu', value: 'menu' },
      ],
    });
    await g.ui.fade(false, 600);
    const choice = await screen;
    if (choice === 'next') await g.startChapter(4);
    else {
      await g.ui.fade(true, 300);
      g.showMainMenu();
      await g.ui.fade(false, 400);
    }
  },
};
