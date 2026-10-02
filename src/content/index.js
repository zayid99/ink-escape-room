// Content registry: everything the engine needs to know about the game's world.

import { ITEMS } from './items.js';
import { CLUES } from './clues.js';
import { JOURNAL } from './journal.js';
import { DOCUMENTS } from './documents.js';
import { CHAPTER1_ROOMS, CHAPTER1_PUZZLES, chapter1 } from './chapter1/index.js';
import { CHAPTER2_ROOMS, CHAPTER2_PUZZLES, chapter2 } from './chapter2/index.js';
import { ITEMS2, CLUES2, DOCS2, JOURNAL2 } from './chapter2/data.js';
import { CHAPTER3_ROOMS, CHAPTER3_PUZZLES, chapter3 } from './chapter3/index.js';
import { ITEMS3, CLUES3, DOCS3, JOURNAL3 } from './chapter3/data.js';
import { CHAPTER4_ROOMS, CHAPTER4_PUZZLES, chapter4 } from './chapter4/index.js';
import { CLUES4, DOCS4, JOURNAL4 } from './chapter4/data.js';

export const CONTENT = {
  rooms: { ...CHAPTER1_ROOMS, ...CHAPTER2_ROOMS, ...CHAPTER3_ROOMS, ...CHAPTER4_ROOMS },
  items: { ...ITEMS, ...ITEMS2, ...ITEMS3 },
  clues: { ...CLUES, ...CLUES2, ...CLUES3, ...CLUES4 },
  journal: { ...JOURNAL, ...JOURNAL2, ...JOURNAL3, ...JOURNAL4 },
  documents: { ...DOCUMENTS, ...DOCS2, ...DOCS3, ...DOCS4 },
  puzzles: { ...CHAPTER1_PUZZLES, ...CHAPTER2_PUZZLES, ...CHAPTER3_PUZZLES, ...CHAPTER4_PUZZLES },
  chapters: { 1: chapter1, 2: chapter2, 3: chapter3, 4: chapter4 },
  /** The room drawn behind the main menu, and where the figure stands in it. */
  menuRoom: 'study',
  menuPlayerX: 460,
};
