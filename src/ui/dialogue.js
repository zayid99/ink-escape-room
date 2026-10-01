// Taped-note dialogue box with a typewriter reveal. Lines are strings or
// { text, red?: boolean, speaker?: string }. Red lines are written in red pen.

import { Modal } from './modal.js';
import { el } from './dom.js';

export class DialogueBox extends Modal {
  constructor(ui, lines, { settings, audio }) {
    super(ui, { className: 'dialogue-modal', closeOnEsc: false, pausesWorld: false, label: 'Dialogue' });
    this.lines = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
    this.index = -1;
    this.settings = settings;
    this.audio = audio;
    this.timer = null;
  }

  mount() {
    this.textEl = el('p', { class: 'dlg-text', 'aria-live': 'polite' });
    this.speakerEl = el('p', { class: 'dlg-speaker' });
    this.moreEl = el('span', { class: 'dlg-more', 'aria-hidden': 'true', text: '▸' });
    this.box = el('div', { class: 'dlg-box', tabindex: '0' }, [this.speakerEl, this.textEl, this.moreEl]);
    this.box.addEventListener('click', (e) => {
      e.stopPropagation();
      this.advance();
    });
    this.el.append(this.box);
    this.next();
  }

  next() {
    this.index++;
    if (this.index >= this.lines.length) {
      this.close(true);
      return;
    }
    const line = this.lines[this.index];
    this.box.classList.toggle('red', !!line.red);
    this.box.style.setProperty('--tilt', `${(this.index % 2 ? 1 : -1) * (0.6 + Math.random() * 0.9)}deg`);
    this.speakerEl.textContent = line.speaker || '';
    this.speakerEl.hidden = !line.speaker;
    this.full = line.text;
    this.shown = 0;
    this.moreEl.classList.remove('ready');
    const cps = this.settings.get('textSpeed');
    clearInterval(this.timer);
    if (!cps) {
      this.finishLine();
      return;
    }
    this.textEl.textContent = '';
    const step = Math.max(1, Math.round(cps / 60));
    this.timer = setInterval(() => {
      this.shown = Math.min(this.full.length, this.shown + step);
      this.textEl.textContent = this.full.slice(0, this.shown);
      if (this.shown >= this.full.length) this.finishLine();
    }, 1000 / Math.min(cps, 60));
  }

  finishLine() {
    clearInterval(this.timer);
    this.timer = null;
    this.shown = this.full.length;
    this.textEl.textContent = this.full;
    this.moreEl.classList.add('ready');
  }

  advance() {
    if (this.timer) this.finishLine();
    else this.next();
  }

  onAction(action) {
    if (action === 'interact') this.advance();
    // Let Esc fall through so the pause menu can open over the conversation.
    else if (action === 'pause') return false;
    return true;
  }

  onCanvasClick() {
    this.advance();
  }

  focusFirst() {
    this.box?.focus({ preventScroll: true });
  }

  dispose() {
    clearInterval(this.timer);
  }
}
