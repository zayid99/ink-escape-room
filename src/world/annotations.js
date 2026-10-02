// Red-pen marks drawn into the world itself: circles, cross-outs, scrawled words.
// They persist in game state and write themselves in when first added, so the
// journal visibly changes its mind about the room.

import { RED, INK, FONT_HAND } from '../render/ink.js';
import { clamp01 } from '../core/math.js';

const DURATION = { text: 1.4, circle: 0.8, cross: 0.6, underline: 0.5, arrow: 0.6, scribble: 0.9, tally: 1.2 };

export class Annotations {
  constructor(game) {
    this.game = game;
  }

  list(roomId) {
    return this.game.state.annotations[roomId] || [];
  }

  has(roomId, id) {
    return this.list(roomId).some((a) => a.id === id);
  }

  /**
   * Add a mark. a = { id, type, x, y, w?, h?, x2?, y2?, text?, size?, rot?, ink?: true for black, count? }
   * `instant` marks appear already written (e.g. notes from previous nights).
   */
  add(roomId, a, { instant = false, sound = true } = {}) {
    if (this.has(roomId, a.id)) return false;
    const st = this.game.state;
    if (!st.annotations[roomId]) st.annotations[roomId] = [];
    st.annotations[roomId].push({ ...a, born: instant ? -1000 : st.playTime });
    if (!instant && sound) this.game.audio.play('pen', { volume: 0.7 });
    this.game.changed();
    return true;
  }

  draw(pen, roomId) {
    const now = this.game.state.playTime;
    for (const a of this.list(roomId)) {
      const frac = clamp01((now - a.born) / (DURATION[a.type] || 1));
      const col = a.ink ? INK : RED;
      pen.begin(`ann-${a.id}`);
      switch (a.type) {
        case 'text':
          pen.text(a.text, a.x, a.y, { size: a.size || 16, col, font: FONT_HAND, rot: a.rot || 0, reveal: frac });
          break;
        case 'circle':
          pen.ellipse(a.x + a.w / 2, a.y + a.h / 2, a.w / 2, a.h / 2, { col, w: 1.5, frac });
          break;
        case 'cross':
          pen.cross(a.x, a.y, a.w, a.h, { col, frac });
          break;
        case 'underline':
          pen.underline(a.x, a.y, a.w, { col, frac });
          break;
        case 'arrow':
          pen.arrow(a.x, a.y, a.x2, a.y2, { col, frac });
          break;
        case 'scribble':
          pen.scribble(a.x, a.y, a.w, a.h, { col, frac, density: a.density || 10 });
          break;
        case 'tally': {
          const n = Math.ceil((a.count || 4) * frac);
          for (let i = 0; i < n; i++) pen.line(a.x + i * 7, a.y, a.x + i * 7 + 1.5, a.y + a.h, { col, w: 1.8 });
          break;
        }
        default:
          break;
      }
    }
  }
}
