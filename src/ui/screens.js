// Full-screen story cards: chapter titles, the end of a chapter, game over and the ending.

import { Modal } from './modal.js';
import { el, inline, sketchCanvas } from './dom.js';

/** "Chapter One — The Margin". Auto-dismisses; any input skips. */
export class TitleCard extends Modal {
  constructor(ui, { eyebrow, title, line, ms = 4200 }) {
    super(ui, { className: 'title-card', closeOnEsc: true, label: title });
    this.o = { eyebrow, title, line, ms };
  }

  mount() {
    this.el.append(
      el('div', { class: 'card-inner' }, [
        el('p', { class: 'card-eyebrow', text: this.o.eyebrow }),
        el('h1', { class: 'card-title', text: this.o.title }),
        this.o.line ? el('p', { class: 'card-line red-pen' }, [inline(this.o.line)]) : null,
      ]),
    );
    this.el.addEventListener('click', () => this.close(true));
    this.timer = setTimeout(() => this.close(true), this.o.ms);
  }

  onAction(action) {
    if (action === 'interact' || action === 'pause') this.close(true);
    return true;
  }

  onCanvasClick() {
    this.close(true);
  }

  dispose() {
    clearTimeout(this.timer);
  }
}

/** Generic end screen used for chapter ends, game over and endings. */
export class EndScreen extends Modal {
  /**
   * @param {{ variant:'chapter'|'gameover'|'ending', eyebrow, title, paragraphs:string[], stats?:[string,string][],
   *           buttons:{label,value,primary?}[], sketch?: { draw, w, h, label }, boil?: () => number }} o
   */
  constructor(ui, o) {
    super(ui, { className: `end-screen variant-${o.variant}`, closeOnEsc: false, label: o.title });
    this.o = o;
  }

  mount() {
    const o = this.o;
    let figure = null;
    if (o.sketch) {
      const sk = sketchCanvas(o.sketch.draw, o.sketch.w, o.sketch.h, { boil: o.boil || (() => 1), label: o.sketch.label });
      this.dispose = sk.dispose;
      figure = el('figure', { class: 'end-sketch' }, [sk.node]);
    }
    this.el.append(
      el('div', { class: 'end-inner' }, [
        el('p', { class: 'card-eyebrow', text: o.eyebrow }),
        el('h1', { class: 'card-title', text: o.title }),
        figure,
        ...(o.paragraphs || []).map((p) => el('p', { class: 'end-p' }, [inline(p)])),
        o.stats
          ? el(
              'dl',
              { class: 'end-stats' },
              o.stats.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })]),
            )
          : null,
        el(
          'div',
          { class: 'menu-row' },
          o.buttons.map((b, i) => el('button', { class: `menu-btn${b.primary ? ' primary' : ''}`, text: b.label, autofocus: i === 0, onclick: () => this.close(b.value) })),
        ),
      ]),
    );
  }

  onAction() {
    return true;
  }
}
