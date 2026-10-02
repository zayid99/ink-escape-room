// Puzzle framework. A puzzle is declared in content with an id and a kind; this module
// owns its solved-state bookkeeping and opens the right interface for it.
//
// Kinds implemented:
//   'code'  — combination lock (see ui/codeLock.js)
//   'steps' — multi-step / observation puzzle tracked by named steps (content drives the UI)
//   'order' — put cards in the right sequence (see ui/orderPuzzle.js)

import { CodeLock } from '../ui/codeLock.js';
import { OrderPuzzle } from '../ui/orderPuzzle.js';

export class Puzzles {
  constructor(game, defs) {
    this.game = game;
    this.defs = defs;
  }

  get state() {
    return this.game.state;
  }

  isSolved(id) {
    return !!this.state.solved[id];
  }

  markSolved(id) {
    if (this.isSolved(id)) return;
    this.state.solved[id] = true;
    this.game.changed();
    this.game.bus.emit('puzzle:solved', { id });
  }

  // ---- 'steps' puzzles ----

  stepsDone(id) {
    const def = this.defs[id];
    return def.steps.filter((s) => this.state.flags[`${id}.${s}`]).length;
  }

  /** Record a step. Returns { isNew, done, total, complete }. */
  completeStep(id, step) {
    const def = this.defs[id];
    if (!def || !def.steps.includes(step)) {
      console.error(`[puzzles] unknown step ${id}.${step}`);
      return { isNew: false, done: 0, total: 0, complete: false };
    }
    const key = `${id}.${step}`;
    const isNew = !this.state.flags[key];
    if (isNew) {
      this.state.flags[key] = true;
      this.game.changed();
    }
    const done = this.stepsDone(id);
    const complete = done === def.steps.length;
    if (complete) this.markSolved(id);
    return { isNew, done, total: def.steps.length, complete };
  }

  // ---- 'code' puzzles ----

  /**
   * Open a combination lock. Resolves true when solved.
   * def: { digits, solution: string | (code, game) => boolean, title, tag: string | (game) => string,
   *        brand, onWrong?(code, game) => { message, red, redId } }
   */
  openCodeLock(id) {
    const def = this.defs[id];
    if (!def || def.kind !== 'code') throw new Error(`[puzzles] "${id}" is not a code puzzle`);
    const g = this.game;
    const attemptsKey = `${id}.attempts`;
    const lock = new CodeLock(
      g.ui,
      {
        title: def.title,
        digits: def.digits,
        tag: typeof def.tag === 'function' ? def.tag(g) : def.tag,
        brand: def.brand,
        variant: def.variant,
        tryLabel: def.tryLabel,
        initial: this.state.flags[`${id}.last`] || '',
        redNotes: (def.redNotes || []).filter((n) => this.state.flags[`${id}.red.${n.id}`]).map((n) => n.text),
        onSubmit: async (code) => {
          this.state.flags[`${id}.last`] = code;
          this.state.flags[attemptsKey] = (this.state.flags[attemptsKey] || 0) + 1;
          const right = typeof def.solution === 'function' ? def.solution(code, g) : code === def.solution;
          if (right) {
            g.audio.play('unlock');
            this.markSolved(id);
            return { ok: true, message: def.solvedText };
          }
          const custom = def.onWrong?.(code, g) || {};
          if (custom.redId) this.state.flags[`${id}.red.${custom.redId}`] = true;
          g.changed();
          return { ok: false, ...custom };
        },
      },
      { audio: g.audio },
    );
    return g.ui.open(lock);
  }

  // ---- 'order' puzzles ----

  /**
   * def: { title, intro, cards: {id,label,detail}[], solution: string[], slotLabels?,
   *        onWrong?(order, game) => { message, red } }
   */
  openOrder(id) {
    const def = this.defs[id];
    if (!def || def.kind !== 'order') throw new Error(`[puzzles] "${id}" is not an order puzzle`);
    const g = this.game;
    const puzzle = new OrderPuzzle(
      g.ui,
      {
        title: def.title,
        intro: typeof def.intro === 'function' ? def.intro(g) : def.intro,
        cards: def.cards,
        slotLabels: def.slotLabels,
        initial: this.state.flags[`${id}.last`] || null,
        onSubmit: async (order) => {
          this.state.flags[`${id}.last`] = order;
          if (order.join('|') === def.solution.join('|')) {
            this.markSolved(id);
            return { ok: true, message: def.solvedText };
          }
          g.changed();
          return { ok: false, ...(def.onWrong?.(order, g) || {}) };
        },
      },
      { audio: g.audio },
    );
    return g.ui.open(puzzle);
  }
}
