// Journal pages. `old: true` marks the sketchbook's earliest pages (2004), written in
// a child's hand. Pages are unlocked by content via g.addEntry(id).

import { sketchTallManDoorway, sketchNurseryMemory } from './sketches.js';

export const JOURNAL = {
  old_tallman: {
    title: 'The tall man',
    date: 'January 2004',
    old: true,
    onRead: (g) => g.addClue('old_tall_man'),
    blocks: [
      { hand: 'The tall man came again last night. He stands in the doorway and doesn’t do anything. He doesn’t have a face, he is just where the dark isn’t.' },
      { hand: 'He only comes when the radiators knock.' },
      { hand: 'Mum saw him too but she says it’s her migraines. Wren lights her candle so he goes away. It works. (It doesn’t.)' },
      { sketch: sketchTallManDoorway, w: 380, h: 220, label: 'A child’s drawing: a tall figure as a gap in a dark doorway, a radiator, and a candle.' },
      { meta: 'Pencil, a child’s hand. The paper has gone soft at the corners.' },
    ],
  },
  old_red: {
    title: 'Lark time',
    date: 'February 2004',
    old: true,
    onRead: (g) => {
      g.addClue('wren_corrects');
      g.addClue('lark_time', { silent: true });
    },
    blocks: [
      { hand: 'Dad says all our clocks are on Lark time, forty minutes fast, so we never miss low water. I said that is just lying with clocks. He laughed.' },
      { hand: 'Wren corrected my drawing of our room AGAIN. In RED. She says I drew her bed wrong. It is MY drawing.' },
      { red: 'you DID draw it wrong — W', rot: -4 },
      { meta: 'A child’s hand, and a smaller child’s red pen pressing hard.' },
    ],
  },
  tonight: {
    title: 'Tonight',
    date: 'November',
    blocks: [
      { hand: 'Came over on the last ferry. The tide was already turning on the causeway behind me.' },
      { hand: 'Wren isn’t here. Her case is. Her coat isn’t.' },
      { hand: 'Father’s house looks smaller. All his clocks have stopped. I’ll look properly in the morning.' },
      { hand: '— M.' },
    ],
  },
  nursery_memory: {
    title: 'The nursery, from memory',
    date: 'November',
    blocks: (state) => [
      { sketch: sketchNurseryMemory(state), w: 380, h: 230, label: 'A sketch of the nursery: two beds, a window with curtains, a small door on the right wall.' },
      { hand: 'Our room, the way I remember it. I drew this so I would know it when I saw it again.' },
      state.flags['nursery_memory.complete'] ? { red: 'Three things wrong. Or three things right that I didn’t want to see.' } : null,
    ],
  },
  night_1: {
    title: 'Night 1',
    date: 'Pages stuck together',
    blocks: [
      { hand: 'Came over on the last ferry. Wren isn’t here. Her case is. It’s freezing — I got the boiler going. Father would have a fit.' },
      { hand: '— M.' },
    ],
  },
  night_2: {
    title: 'Night 2',
    date: 'Pages stuck together',
    blocks: [
      { hand: 'Came over on the last ferry. Wren isn’t here. Her case is.' },
      { red: 'You wrote that yesterday.', rot: -2 },
      { hand: 'Somebody keeps opening the window. I keep shutting it.' },
      { hand: '— M.' },
    ],
  },
  night_3: {
    title: 'Night 3',
    date: 'Pages stuck together',
    blocks: [
      { hand: 'Came over on the last ferry. Wren isn’t' },
      { red: 'STOP WRITING THAT', rot: -5, size: 1.4 },
      { red: 'The clocks are lying. Count the nights. Leave yourself marks somewhere you’ll find them.', rot: -2 },
      { red: 'Marked the back-stair door. One for every night. You’ll find it — you always knew where it was.', rot: -3 },
      { meta: 'The rest of the page is wet and has dried in ripples. It smells of the sea.' },
    ],
  },
};
