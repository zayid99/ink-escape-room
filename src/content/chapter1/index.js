// Chapter 1 — "The Margin". Attic floor of Wexley House: study → landing → nursery.

import { study } from './study.js';
import { landing } from './landing.js';
import { nursery } from './nursery.js';

export const CHAPTER1_ROOMS = { study, landing, nursery };

/** Clues that can be found in Chapter 1 (for the end-of-chapter tally). */
const CHAPTER1_CLUES = [
  'cover_note', 'clock_317', 'abel_note', 'window_wedged', 'rook_matches', 'suitcase', 'ferry_ticket', 'four_days',
  'tall_man_drawings', 'alarm_battery', 'slept_in', 'radiator', 'lark_time', 'longcase', 'family_photo', 'height_marks',
  'new_padlock', 'padlock_tag', 'tall_man_seen', 'music_box', 'headboard', 'curtains', 'candle_stub', 'dollhouse',
  'dragon', 'tally', 'red_pen', 'old_tall_man', 'wren_corrects',
];

export const CHAPTER1_PUZZLES = {
  study_door: { kind: 'steps', steps: ['paper', 'push', 'key'] },
  nursery_padlock: {
    kind: 'code',
    digits: 4,
    solution: '0237',
    title: 'Father’s padlock',
    brand: 'E. LARK · GANNET',
    tag: 'Only the **true** minute opens this. — E.',
    solvedText: 'The shackle drops open.',
    redNotes: [{ id: 'told', text: 'Told you. Don’t trust the clocks.' }],
    onWrong(code, g) {
      if (code === '0317' || code === '3170' || code === '1517') {
        return { message: 'The shackle doesn’t move. 3:17 is the minute on the clock.', red: 'Told you. Don’t trust the clocks.', redId: 'told' };
      }
      if (!g.story.hasClue('lark_time')) return { message: 'The shackle doesn’t move. The true minute… true according to what?' };
      return { message: 'The shackle doesn’t move.' };
    },
  },
  nursery_memory: { kind: 'steps', steps: ['bed', 'curtains', 'wardrobe'] },
};

export const chapter1 = {
  number: 1,
  title: 'The Margin',

  async begin(g) {
    g.state.chapter = 1;
    // Notes "from previous nights" are already on the page when she wakes.
    g.annotate('study', { id: 'clock-circle', type: 'circle', x: 396, y: 162, w: 36, h: 36 }, { instant: true });
    g.annotate('study', { id: 'clock-note', type: 'text', text: '3:17 again?', x: 344, y: 156, size: 16, rot: -0.12 }, { instant: true });
    g.annotate('study', { id: 'window-note', type: 'text', text: 'keeps opening', x: 226, y: 66, size: 14, rot: -0.05 }, { instant: true });
    await g.titleCard({ eyebrow: 'Chapter One', title: 'The Margin', line: 'Gannet Island · Wexley House · 3:17 a.m.' });
    await g.wait(400);
    await g.say(
      '…I fell asleep at the desk.',
      'The candle’s burned almost to nothing. The clock says 3:17.',
      'Wren came out here to empty Father’s house. Then she stopped answering her phone.',
      'I took the last ferry across before the tide came in. I remember that much.',
      'I’ll find her. And then we’re leaving this island. Both of us.',
    );
    g.objective('Find a way out of the attic room.');
    g.hud.hint('A / D or ← → to walk · E to interact · mouse aims the torch · I pockets · J journal · Esc pause', 9000);
    g.saveNow();
  },

  async resume() {},

  async end(g) {
    g.setFlag('ch1_complete');
    g.saveNow();
    g.audio.setTension(0);
    g.sfx('door', { volume: 0.6 });
    await g.ui.fade(true, 900);
    const found = CHAPTER1_CLUES.filter((id) => g.story.hasClue(id)).length;
    const screen = g.endScreen({
      variant: 'chapter',
      eyebrow: 'End of Chapter One',
      title: 'The Margin',
      paragraphs: [
        'The back stair goes down into the dark, and the dark smells of the sea.',
        'Someone has been writing to her in red for four nights. Someone has been locking her in. Someone has been opening the window.',
        '[[Chapter Two — “Lark Time” — is still being drawn.]]',
      ],
      stats: [
        ['Clues noted', `${found} of ${CHAPTER1_CLUES.length}`],
        ['Time on the island', g.stats().time],
      ],
      buttons: [
        { label: 'Return to the menu', value: 'menu', primary: true },
        { label: 'Stay in the nursery', value: 'stay' },
      ],
    });
    await g.ui.fade(false, 600);
    const choice = await screen;
    if (choice === 'menu') {
      await g.ui.fade(true, 300);
      g.showMainMenu();
      await g.ui.fade(false, 400);
    }
  },
};
