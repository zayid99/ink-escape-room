// Base class for anything that takes over input: menus, documents, puzzles, dialogue.

import { el } from './dom.js';

export class Modal {
  /**
   * @param {import('./ui.js').UI} ui
   * @param {{ className?: string, closeOnEsc?: boolean, pausesWorld?: boolean, label?: string }} opts
   */
  constructor(ui, opts = {}) {
    this.ui = ui;
    this.closeOnEsc = opts.closeOnEsc ?? true;
    this.pausesWorld = opts.pausesWorld ?? true;
    this.el = el('div', {
      class: `modal ${opts.className || ''}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': opts.label || 'Dialog',
    });
    this.closed = false;
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  /** Build DOM; called once when opened. */
  mount() {}

  /** Return true if the action was consumed. */
  onAction(action) {
    if (action === 'pause' && this.closeOnEsc) this.close(null);
    // Modals swallow every action so the world never reacts underneath them.
    return true;
  }

  /** Raw key events (digits, arrows) while on top. */
  onKey() {}

  /** Click on the game canvas while this modal is on top. */
  onCanvasClick() {}

  focusFirst() {
    const target = this.el.querySelector('[autofocus], button:not([disabled]), [tabindex="0"]');
    target?.focus({ preventScroll: true });
  }

  close(value) {
    if (this.closed) return;
    this.closed = true;
    this.dispose?.();
    this.ui.remove(this);
    this.resolve(value);
  }
}
