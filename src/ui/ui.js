// UI manager: owns the DOM overlay, the modal stack, the HUD, toasts and page fades.

import { el } from './dom.js';

export class UI {
  constructor(root, bus) {
    this.root = root;
    this.bus = bus;
    this.stack = [];
    this.hudLayer = el('div', { class: 'hud-layer' });
    this.modalLayer = el('div', { class: 'modal-layer' });
    this.toastLayer = el('div', { class: 'toast-layer', 'aria-live': 'polite' });
    this.fadeEl = el('div', { class: 'fade', 'aria-hidden': 'true' });
    root.append(this.hudLayer, this.modalLayer, this.toastLayer, this.fadeEl);
  }

  /** Open a modal; resolves with its close value. */
  open(modal) {
    const prev = this.top();
    prev?.el.classList.add('under');
    this.stack.push(modal);
    modal.mount();
    this.modalLayer.append(modal.el);
    requestAnimationFrame(() => {
      modal.el.classList.add('shown');
      modal.focusFirst();
    });
    this.bus.emit('ui:changed', { open: true });
    return modal.promise;
  }

  remove(modal) {
    const i = this.stack.indexOf(modal);
    if (i >= 0) this.stack.splice(i, 1);
    modal.el.classList.remove('shown');
    modal.el.classList.add('leaving');
    setTimeout(() => modal.el.remove(), 180);
    const top = this.top();
    if (top) {
      top.el.classList.remove('under');
      top.focusFirst();
    }
    this.bus.emit('ui:changed', { open: this.stack.length > 0 });
  }

  top() {
    return this.stack[this.stack.length - 1] || null;
  }

  /** True when the world should not update (menus, documents, puzzles). */
  worldPaused() {
    return this.stack.some((m) => m.pausesWorld);
  }

  /** True when the player can't act in the world. */
  blocking() {
    return this.stack.length > 0;
  }

  closeAll() {
    for (const m of [...this.stack].reverse()) m.close(null);
  }

  handleAction(action) {
    const top = this.top();
    if (!top) return false;
    return top.onAction(action) !== false;
  }

  handleKey(payload) {
    this.top()?.onKey(payload);
  }

  handleCanvasClick(p) {
    const top = this.top();
    if (!top) return false;
    top.onCanvasClick(p);
    return true;
  }

  toast(text, { red = false, ms = 2600 } = {}) {
    const t = el('div', { class: `toast${red ? ' red' : ''}`, text });
    this.toastLayer.append(t);
    requestAnimationFrame(() => t.classList.add('shown'));
    setTimeout(() => {
      t.classList.remove('shown');
      setTimeout(() => t.remove(), 400);
    }, ms);
    // Never let toasts pile up.
    while (this.toastLayer.children.length > 3) this.toastLayer.firstChild.remove();
  }

  /** Paper "page turn" fade. */
  fade(toOpaque, ms = 380) {
    return new Promise((resolve) => {
      this.fadeEl.style.transitionDuration = `${ms}ms`;
      this.fadeEl.classList.toggle('on', toOpaque);
      setTimeout(resolve, ms + 20);
    });
  }
}
