// Combination-lock puzzle UI: N digit wheels, a paper tag with the clue, and a
// space for the journal to scrawl back at you in red.

import { Modal } from './modal.js';
import { el, inline } from './dom.js';

export class CodeLock extends Modal {
  /**
   * @param {object} opts
   *  title, digits (default 4), tag (string w/ inline markup), hint,
   *  initial (string), redNotes (string[] already scrawled),
   *  onSubmit(code) => { ok: boolean, message?: string, red?: string } | Promise<...>
   */
  constructor(ui, opts, { audio }) {
    super(ui, { className: 'lock-modal', label: opts.title || 'Combination lock' });
    this.opts = opts;
    this.audio = audio;
    this.digits = opts.digits || 4;
    this.values = (opts.initial || '').padEnd(this.digits, '0').slice(0, this.digits).split('').map(Number);
    this.cursor = 0;
    this.busy = false;
  }

  mount() {
    const o = this.opts;
    this.wheels = [];
    const wheelRow = el('div', { class: 'lock-wheels', role: 'group', 'aria-label': 'Combination wheels' });
    for (let i = 0; i < this.digits; i++) {
      const valueEl = el('output', { class: 'wheel-value', 'aria-live': 'polite' });
      const up = el('button', { class: 'wheel-btn', 'aria-label': `Wheel ${i + 1} up`, text: '▲', onclick: () => this.spin(i, 1) });
      const down = el('button', { class: 'wheel-btn', 'aria-label': `Wheel ${i + 1} down`, text: '▼', onclick: () => this.spin(i, -1) });
      const wheel = el('div', { class: 'wheel', onclick: () => this.select(i) }, [up, valueEl, down]);
      wheelRow.append(wheel);
      this.wheels.push({ wheel, valueEl });
    }
    this.messageEl = el('p', { class: 'lock-message', 'aria-live': 'assertive' });
    this.redEl = el('div', { class: 'lock-red' });
    for (const note of o.redNotes || []) this.redEl.append(el('p', { class: 'red-pen scrawl shown' }, [inline(note)]));

    const tag = el('div', { class: 'lock-tag' }, [el('p', {}, [inline(o.tag || '')])]);
    this.body = el('div', { class: 'lock-body' }, [
      el('div', { class: 'lock-shackle' }),
      el('div', { class: 'lock-case' }, [el('p', { class: 'lock-brand', text: o.brand || 'E. LARK · GANNET' }), wheelRow]),
    ]);
    const tryBtn = el('button', { class: 'ink-btn', text: 'Try the lock', onclick: () => this.submit() });
    const leaveBtn = el('button', { class: 'ink-btn ghost', text: 'Step back', onclick: () => this.close(false) });
    this.el.append(
      el('div', { class: 'lock-wrap' }, [
        el('h2', { class: 'lock-title', text: o.title || 'Combination lock' }),
        el('div', { class: 'lock-stage' }, [this.body, tag, this.redEl]),
        this.messageEl,
        el('p', { class: 'lock-help', text: 'Type digits or use ▲▼ · ←→ choose wheel · E / Enter to try · Esc to step back' }),
        el('div', { class: 'lock-actions' }, [tryBtn, leaveBtn]),
      ]),
    );
    this.refresh();
  }

  /** Focus the lock itself (not a ▲ button) so Enter tries the code instead of spinning a wheel. */
  focusFirst() {
    const wrap = this.el.querySelector('.lock-wrap');
    wrap.tabIndex = -1;
    wrap.focus({ preventScroll: true });
  }

  refresh() {
    this.wheels.forEach(({ wheel, valueEl }, i) => {
      valueEl.textContent = String(this.values[i]);
      wheel.classList.toggle('active', i === this.cursor);
    });
  }

  select(i) {
    this.cursor = i;
    this.refresh();
  }

  spin(i, d) {
    if (this.busy) return;
    this.cursor = i;
    this.values[i] = (this.values[i] + d + 10) % 10;
    this.audio.play('click', { volume: 0.7 });
    this.refresh();
  }

  async submit() {
    if (this.busy) return;
    this.busy = true;
    const code = this.values.join('');
    let result;
    try {
      result = await this.opts.onSubmit(code);
    } catch (err) {
      console.error('[codeLock] submit failed', err);
      result = { ok: false };
    }
    if (this.closed) return;
    if (result?.ok) {
      this.body.classList.add('open');
      this.messageEl.textContent = result.message || 'The shackle drops open.';
      setTimeout(() => this.close(true), 1100);
      return;
    }
    this.audio.play('wrong');
    this.body.classList.remove('shake');
    void this.body.offsetWidth; // restart the animation
    this.body.classList.add('shake');
    this.messageEl.textContent = result?.message || 'The shackle doesn’t move.';
    if (result?.red) this.scrawl(result.red);
    this.busy = false;
  }

  /** Red pen appears on the page, stroke by stroke. */
  scrawl(text) {
    const p = el('p', { class: 'red-pen scrawl' }, [inline(text)]);
    this.redEl.append(p);
    this.audio.play('pen', { volume: 0.8 });
    requestAnimationFrame(() => p.classList.add('shown'));
  }

  onAction(action) {
    if (action === 'pause') this.close(false);
    else if (action === 'interact') this.submit();
    else if (action === 'left') this.select((this.cursor + this.digits - 1) % this.digits);
    else if (action === 'right') this.select((this.cursor + 1) % this.digits);
    return true;
  }

  onKey({ code, event }) {
    if (this.busy) return;
    const m = /^(?:Digit|Numpad)(\d)$/.exec(code);
    if (m) {
      this.values[this.cursor] = Number(m[1]);
      this.audio.play('click', { volume: 0.7 });
      this.cursor = Math.min(this.digits - 1, this.cursor + 1);
      this.refresh();
      event?.preventDefault();
    } else if (code === 'ArrowUp') this.spin(this.cursor, 1);
    else if (code === 'ArrowDown') this.spin(this.cursor, -1);
    else if (code === 'ArrowLeft') this.select((this.cursor + this.digits - 1) % this.digits);
    else if (code === 'ArrowRight') this.select((this.cursor + 1) % this.digits);
    else if (code === 'Backspace') this.select(Math.max(0, this.cursor - 1));
  }
}
