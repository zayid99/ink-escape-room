// A decision on paper: a short text and a few options. Options can be disabled with a
// reason, so the story can show a choice the protagonist isn't ready to make yet.

import { Modal } from './modal.js';
import { el, inline } from './dom.js';

export class ChoiceDialog extends Modal {
  /**
   * @param {{ title, text?: string|string[], options: { label, value, disabled?, note?, red? }[], cancel?: any }} o
   *   `cancel` — value returned on Esc; omit to make Esc do nothing (a choice that must be made).
   */
  constructor(ui, o) {
    super(ui, { className: 'choice-modal', closeOnEsc: 'cancel' in o, label: o.title });
    this.o = o;
  }

  mount() {
    const o = this.o;
    const texts = [].concat(o.text || []);
    this.el.append(
      el('div', { class: 'menu-panel small choice-panel' }, [
        el('h2', { class: 'menu-h', text: o.title }),
        ...texts.map((t) => el('p', { class: 'menu-text' }, [inline(t)])),
        el(
          'div',
          { class: 'menu-list' },
          o.options.flatMap((opt, i) => [
            el('button', {
              class: `menu-btn${opt.red ? ' danger' : ''}`,
              text: opt.label,
              disabled: opt.disabled,
              autofocus: i === o.options.findIndex((x) => !x.disabled),
              onclick: () => this.close(opt.value),
            }),
            opt.note ? el('p', { class: 'menu-saveinfo' }, [inline(opt.note)]) : null,
          ]),
        ),
      ]),
    );
  }

  onAction(action) {
    if (action === 'pause' && 'cancel' in this.o) this.close(this.o.cancel);
    return true;
  }
}
