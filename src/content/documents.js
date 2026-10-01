// Readable documents. See ui/blocks.js for the block format.
// Inline markup: ~~struck~~  [[red pen]]  **bold**  *italic*

import { sketchCrumpled, sketchFamilyPhoto, sketchHeightMarks, sketchDragon, sketchNurseryMemory } from './sketches.js';

export const DOCUMENTS = {
  journal_cover: {
    title: '',
    kind: 'journal',
    pages: [
      [
        { hand: 'MAREN LARK — PRIVATE — *keep out* (this means you)' },
        { meta: 'Written inside the cover in a child’s capitals, faded brown.' },
        { rule: true },
        { red: 'Don’t trust the clocks.', size: 1.5, rot: -3 },
        { red: 'Don’t trust me either.', size: 1.5, rot: -2 },
        { red: '— ~~W~~ M', align: 'right', size: 1.4, rot: -4 },
      ],
    ],
  },

  abel_note: {
    title: '',
    kind: 'note',
    pages: [
      [
        { hand: 'Wren —' },
        { hand: 'I’ve locked your door and the stair door. I’m sorry. You walked into the water last night, up to your knees, and you didn’t know me when I brought you back. You won’t remember this either.' },
        { hand: 'I’ll come over at low water. Keep the window open a crack. Please.' },
        { hand: '**Don’t relight anything.**' },
        { hand: '— A.R.', },
        { meta: 'Pencil on lined paper torn from a pocket book. Slid under the door from the landing side.' },
      ],
    ],
  },

  tide_table: {
    title: 'Gannet Island — Causeway Tides',
    kind: 'card',
    pages: [
      [
        { meta: 'November · Low water · Times as printed (GMT)' },
        {
          header: true,
          table: [
            ['Date', 'Morning', 'Evening'],
            ['Sun 9', '04:41', '17:02'],
            ['[[Mon 10]]', '05:20', '17:44'],
            ['Tue 11', '05:58', '18:21'],
            ['Wed 12', '06:33', '18:56'],
            ['Thu 13', '06:51', '19:14'],
            ['Fri 14', '07:10', '19:32'],
            ['Sat 15', '07:49', '20:10'],
          ],
        },
        { hand: 'Causeway safe ±2 hrs either side of low water. Use TRUE time — *not* house time! — E.' },
        { meta: 'Pencil in the margin, Father’s hand. The 10th is circled in red.' },
      ],
    ],
  },

  ferry_ticket: {
    title: '',
    kind: 'ticket',
    pages: [
      [
        { stamp: 'GANNET FERRY CO.' },
        { p: 'ROOK & SON · est. 1961' },
        { rule: true },
        { p: '**SINGLE** — Harbour → Gannet Island' },
        { p: 'MON 10 NOV · 17:40 · 1 ADULT' },
        { p: '*Last crossing before the tide. No return sailing tonight.*' },
        { rule: true },
        { meta: 'Found in the front pocket of the suitcase.' },
      ],
    ],
  },

  crumpled: {
    title: 'Crumpled drawings',
    kind: 'paper',
    pages: [
      [
        { sketch: sketchCrumpled, w: 380, h: 240, label: 'Five crumpled drawings of a tall thin figure in a doorway, each crossed out in red.' },
        { meta: 'Five sheets from the wastebasket, smoothed flat. The same figure every time. The same red cross through every one.' },
      ],
    ],
  },

  clock_ledger: {
    title: 'Wexley House — Clock Ledger',
    kind: 'ledger',
    pages: [
      [
        { meta: 'E. Lark · Clockmaker · Gannet Island' },
        {
          header: true,
          table: [
            ['Clock', 'Where', 'Kept at'],
            ['Longcase (Comtoise)', 'Landing', '+40 min'],
            ['Carriage clock', 'Attic study', '+40 min'],
            ['Kitchen wall clock', 'Kitchen', '+40 min'],
            ['Regulator', 'Workshop', 'TRUE (reference)'],
          ],
        },
        { hand: 'Every clock in this house is kept forty minutes ahead of the true time. Lark time. Whoever reads a clock in this house will think the tide is nearer than it is — better early on the causeway than late. The regulator alone keeps true, for reference.' },
        { hand: '— E.L., 1998' },
      ],
      [
        { h: '1998 – 2004' },
        { hand: '12 Jan 04 — Longcase losing two minutes a week. Cleaned, oiled, reset to Lark time.' },
        { hand: '3 Feb 04 — Clara’s canaries, both, overnight. She says it was the cold.' },
        { hand: '9 Feb 04 — Radiators knocking all night again. Head like a drum. The girls are saying things about a man on the landing. Clara too.' },
        { hand: '13 Feb 04 — Asked Abel to come over and look at the boiler. He says not to run it until he has. Cold night.' },
        { meta: 'There is no entry for the 14th.' },
      ],
      [
        { h: 'March 2004' },
        { hand: 'I will not wind them again. Let every clock in this house keep the minute it stopped.' },
        { hand: 'The longcase says 3:17. It always will. But I keep Lark time in my head as well as in my clocks, and I know what the true minute was.' },
        { hand: 'I have put it on their door, so that no one opens it who does not know it.' },
        { meta: 'The handwriting on this page shakes.' },
      ],
    ],
  },

  family_photo: {
    title: '',
    kind: 'photo',
    pages: [
      [
        { sketch: sketchFamilyPhoto, w: 380, h: 250, label: 'A family of four on the causeway. The smaller girl’s face is scribbled out.' },
        { hand: 'E., C., M. & W. — the causeway, August 2003' },
        { meta: 'Written on the back of the print. The scribble on the small girl’s face has gone through the emulsion.' },
      ],
    ],
  },

  height_marks: {
    title: 'Pencil marks on the door frame',
    kind: 'paper',
    pages: [
      [
        { sketch: sketchHeightMarks, w: 380, h: 260, label: 'Height marks on a door frame: M from 2000 to January 2004; W from 2000 to 2012, skipping 2005.' },
        { meta: 'Copied into the journal as they are on the frame. Left side M, right side W.' },
      ],
    ],
  },

  dragon_drawing: {
    title: '',
    kind: 'paper',
    pages: [
      [
        { sketch: sketchDragon, w: 380, h: 230, label: 'A child’s drawing of a boiler with a dragon’s face, pipes running up into the house.' },
        { hand: '*He breathes when the radiators knock. Dad says never go down there.*' },
        { meta: 'Pinned above the bed by the door. Crayon and pencil.' },
      ],
    ],
  },

  nursery_memory: {
    title: 'The nursery, from memory',
    kind: 'journal',
    pages: [
      (state) => [
        { sketch: sketchNurseryMemory(state), w: 380, h: 230, label: 'A sketch of the nursery: two beds, a window with curtains, a small door on the right wall.' },
        { hand: 'Our room, the way I remember it. I drew this so I would know it when I saw it again.' },
        state.flags['nursery_memory.complete']
          ? { red: 'Three things wrong. Or three things right that I didn’t want to see.' }
          : { meta: 'Compare it with the room. What doesn’t match?' },
      ],
    ],
  },
};
