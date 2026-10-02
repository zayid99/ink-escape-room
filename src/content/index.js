// Content registry: everything the engine needs to know about the game's world.
// Add later chapters by registering their rooms, puzzles and chapter script here.

import { ITEMS } from './items.js';
import { CLUES } from './clues.js';
import { JOURNAL } from './journal.js';
import { DOCUMENTS } from './documents.js';
import { CHAPTER1_ROOMS, CHAPTER1_PUZZLES, chapter1 } from './chapter1/index.js';

export const CONTENT = {
  rooms: { ...CHAPTER1_ROOMS },
  items: ITEMS,
  clues: CLUES,
  journal: JOURNAL,
  documents: DOCUMENTS,
  puzzles: { ...CHAPTER1_PUZZLES },
  chapters: { 1: chapter1 },
  /** The room drawn behind the main menu, and where the figure stands in it. */
  menuRoom: 'study',
  menuPlayerX: 460,
};
