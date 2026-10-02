// Chapter 2 — "Lark Time": items, clues, documents and journal pages.

import { RED, INK, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { clockFace } from '../draw.js';

export const ITEMS2 = {
  cassette: {
    name: 'Snapped cassette',
    desc: 'The tape from Father’s answerphone. Pulled out and snapped clean in two.',
    icon(pen) {
      pen.begin('icon-cass');
      pen.fillRect(12, 22, 48, 30, PAPER_LIGHT);
      pen.rect(12, 22, 48, 30, { w: 1.3 });
      pen.circle(26, 37, 5, { w: 1 });
      pen.circle(46, 37, 5, { w: 1 });
      pen.line(30, 46, 38, 58, { w: 1, col: INK });
      pen.line(42, 46, 36, 60, { w: 1, col: INK });
    },
    combine: {
      sticky_tape: async (g) => {
        g.take('cassette');
        g.take('sticky_tape');
        g.give('spliced_tape', { silent: true });
        g.sfx('paper');
        await g.say('I wind the loose ends back, overlap them and tape the splice flat. It’ll play. Once or twice.');
        g.ui.toast('Made — Spliced cassette');
      },
    },
  },
  sticky_tape: {
    name: 'Sticky tape',
    desc: 'A roll of clear tape from the kitchen drawer. Father’s, yellowed at the edges.',
    icon(pen) {
      pen.begin('icon-stape');
      pen.circle(36, 36, 18, { w: 1.4 });
      pen.circle(36, 36, 9, { w: 1 });
      pen.line(52, 42, 62, 56, { w: 1 });
    },
    combine: { cassette: (g) => ITEMS2.cassette.combine.sticky_tape(g) },
  },
  spliced_tape: {
    name: 'Spliced cassette',
    desc: 'The answerphone tape, taped back together. It should play in the machine.',
    icon(pen) {
      ITEMS2.cassette.icon(pen);
      pen.line(30, 44, 42, 44, { w: 2, col: RED });
    },
  },
  fathers_keys: {
    name: 'Father’s keys',
    desc: 'His ring of keys, from under the loaf in the bread crock. One is labelled WORKSHOP in his tiny capitals.',
    icon(pen) {
      pen.begin('icon-fkeys');
      pen.circle(30, 26, 10, { w: 1.4 });
      for (const [a, l] of [[0.9, 28], [1.3, 24], [1.7, 30]]) {
        const x2 = 30 + Math.cos(a) * l;
        const y2 = 26 + Math.sin(a) * l;
        pen.line(30 + Math.cos(a) * 10, 26 + Math.sin(a) * 10, x2, y2, { w: 2 });
      }
    },
  },
  pendulum: {
    name: 'Pendulum bob',
    desc: 'A heavy brass disc on a rod, stamped E.L. It was propping the hall cupboard door open.',
    icon(pen) {
      pen.begin('icon-pend');
      pen.line(36, 6, 36, 40, { w: 2 });
      pen.fillEllipse(36, 50, 14, 14, PAPER_LIGHT);
      pen.circle(36, 50, 14, { w: 1.6 });
      pen.text('E.L', 27, 54, { size: 9, font: FONT_TYPE });
    },
  },
  mothers_keys: {
    name: 'Mother’s keys',
    desc: 'A small ring with a cardboard tag in her handwriting: “darkroom · glasshouse”.',
    icon(pen) {
      pen.begin('icon-mkeys');
      pen.circle(26, 30, 8, { w: 1.2 });
      pen.line(32, 34, 54, 52, { w: 1.8 });
      pen.line(30, 37, 40, 60, { w: 1.8 });
      pen.poly([[44, 14], [62, 18], [60, 30], [42, 26]], { closed: true, w: 0.9 });
      pen.line(34, 26, 44, 20, { w: 0.6 });
    },
  },
};

export const CLUES2 = {
  warm_kettle: { title: 'The kettle is warm', text: 'Somebody boiled it tonight. Somebody who was here while I was locked upstairs.' },
  strangers_tea: { title: 'A stranger’s tea', text: 'Half a mug, milk and two sugars, still warm. Wren takes it black. So do I.' },
  bootprints: { title: 'Boot prints', text: 'Big, wet, a man’s — from the bolted back door to the stove and back. He comes and goes.' },
  phone_note: { title: 'Wren’s phone', text: 'Dead. On the back, in pencil: “Charged it for you. Ring me. — A.”' },
  answerphone: {
    title: 'The answerphone',
    text: 'Abel Rook, to a doctor: “Edmund’s girl… she won’t let me take her off the island. She keeps saying she has to find Wren.” And to Wren: “the front-door code is your birthday.”',
  },
  birthday: { title: 'Father’s calendar', text: 'Still turned to March. “14 — W’s birthday — 31! — ring her (she won’t pick up).”' },
  kitchen_clock: { title: 'The kitchen clock is running', text: 'The only clock in the house that hasn’t stopped. Someone winds it. Lark time — forty minutes fast.' },
  workshop_clocks: { title: 'The workshop', text: 'Every clock on Father’s wall stopped at 3:17. All but the regulator — and that one has lost its pendulum.' },
  regulator: { title: 'The true clock', text: 'I set the regulator to the true time and it struck. Father’s cabinet only opens for the truth.' },
  clara_diary: { title: 'Mother’s diary, 2004', text: 'Headaches. The canaries dying. The tall man on the landing — “only when the radiators knock”. She asked Father to have the boiler seen to.' },
  two_presences: { title: 'Two of them', text: 'The tall man in the mirror behind me — and at the same moment, Abel’s lantern far out on the causeway. Whatever stands behind me isn’t Abel.' },
  the_boiler: {
    title: 'It’s the boiler',
    text: 'The radiators are hot. Father never ran the heating. On my first night I wrote: “I got the boiler going.” The house is poisoning me the way it poisoned them.',
  },
};

const CHILD = '"Caveat", "Comic Sans MS", cursive';

function sketchCalendar(pen, w, h) {
  pen.begin('sk-cal');
  pen.text('MARCH', 20, 34, { size: 22, font: FONT_TYPE });
  const cw = (w - 40) / 7;
  for (let i = 0; i < 31; i++) {
    const col = (i + 6) % 7;
    const row = Math.floor((i + 6) / 7);
    const x = 20 + col * cw;
    const y = 50 + row * 32;
    pen.rect(x, y, cw, 32, { w: 0.5, alpha: 0.5, passes: 1 });
    pen.text(String(i + 1), x + 4, y + 13, { size: 10, font: FONT_TYPE, alpha: 0.7 });
    if (i === 13) {
      pen.circle(x + cw / 2, y + 16, 16, { col: RED, w: 1.3 });
      pen.text('W 31!', x + 6, y + 28, { size: 12, font: CHILD });
    }
  }
}

export const DOCS2 = {
  answerphone: {
    title: 'Answerphone — Wexley House',
    kind: 'ledger',
    pages: [
      [
        { meta: 'Outgoing message. A man’s voice, dry, amused — Father.' },
        { hand: '“Wexley House, Edmund Lark. Leave the time you rang — I’ll know if you were early or late.”' },
        { meta: 'Click. Hiss.' },
      ],
      [
        { meta: 'MEMO — TUE 11 NOV — 23:58. Recorded from the house phone. An old man, out of breath.' },
        { hand: '“Doctor Haldane? Abel Rook, on Gannet. It’s about Edmund’s girl. She’s in the house.”' },
        { hand: '“Some nights she doesn’t know me. She won’t let me take her off the island — she keeps saying she has to find Wren. Over and over. *Find Wren.*”' },
        { hand: '“…No. No, I don’t know what she means by it.”' },
        { hand: '“It’s like the winter of oh-four. I saw the glow from the harbour that night at twenty-five past two by my watch and I ran the causeway. I’m not losing another one of them.”' },
        { hand: '“I’ve hidden Edmund’s keys in the bread crock so she can’t get at the cellar. Saturday, then. The morning boat. I’ll lock her in at night. God forgive me.”' },
      ],
      [
        { meta: 'MESSAGE — THU 13 NOV — 07:15.' },
        { hand: '“Wren, love, it’s Abel. If you hear this — I’ve put a padlock on the front door. The code’s your birthday. I set it so you’d remember even on a bad night.”' },
        { hand: '“Keep a window open. Don’t light anything. I’ll come over at low water.”' },
        { meta: 'End of tape.' },
      ],
    ],
  },
  calendar: {
    title: '',
    kind: 'card',
    pages: [
      [
        { sketch: sketchCalendar, w: 380, h: 250, label: 'A March calendar page with the 14th circled in red: W 31!' },
        { hand: '14 — W’s birthday — 31! — ring her (she won’t pick up)' },
        { meta: 'Father’s calendar, still turned to March. He died in September.' },
      ],
    ],
  },
  workshop_notes: {
    title: 'Workshop notebook',
    kind: 'ledger',
    pages: [
      [
        { meta: 'E. Lark — the regulator' },
        { hand: 'The regulator is the only honest clock in this house. Every other one I keep forty minutes ahead. She keeps the TRUE time, and the others are set from her.' },
        { hand: 'The cabinet latch is tied to her strike. Set her to the true time, let her strike, and it opens. Set her to a lie and she will sulk.' },
        { hand: 'Pendulum off for cleaning, March. Bob is holding the cupboard door in the hall — don’t let me forget.' },
        { meta: 'He forgot.' },
      ],
    ],
  },
  clara_diary: {
    title: 'Clara Lark — 2004',
    kind: 'journal',
    pages: [
      [
        { hand: '*22 January.* Another headache, behind the eyes, all day. Edmund has the same. We are blaming the wind.' },
        { hand: '*30 January.* I saw him again. On the landing, by the stair, just standing. Tall. No face. When I turned the lamp on there was nothing. Maren says she’s seen him too. Wren has started lighting a candle at night “so he goes away”.' },
      ],
      [
        { hand: '*3 February.* Pip and Moth both dead in the cage this morning. Not a mark on them. Edmund says it was the cold — but the glasshouse is the warmest room in the house, with the boiler pipe running under it.' },
        { hand: '*9 February.* He only comes when the radiators knock. I’ve started to listen for them. Maren draws him over and over and crosses him out.' },
      ],
      [
        { hand: '*12 February.* I asked Edmund to have the boiler looked at. He says Abel will come after the girls’ half-term. I said what if it’s the boiler. He said boilers don’t make ghosts, Clara.' },
        { hand: '*13 February.* I took photographs of the girls this morning, to finish the roll. I’ll develop them at the weekend.' },
        { meta: 'The last entry. The rest of the book is blank.' },
      ],
    ],
  },
};

export const JOURNAL2 = {
  night_4: {
    title: 'Night 4',
    date: 'Tonight — written in the hall',
    blocks: [
      { hand: 'He isn’t Abel. Abel was on the causeway with his lantern while the thing stood behind me in the glass.' },
      { hand: 'Mother saw him in 2004. Maren drew him. Father had headaches “like a drum”. The canaries died. And the radiators knocked.' },
      { red: 'It’s the boiler. You lit it. You wrote it down on the first night.', rot: -2 },
      { hand: 'The house isn’t haunted. It’s poisoned. And Abel has been opening the windows to keep me alive.' },
    ],
  },
};

/** The kitchen clock face (used in the room). */
export function drawWallClock(pen, x, y, r, minutes) {
  pen.fillEllipse(x, y, r + 3, r + 3, PAPER_LIGHT);
  clockFace(pen, x, y, r, Math.floor(minutes / 60), minutes % 60, { w: 1.1 });
}
