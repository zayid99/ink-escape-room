// Ordering puzzle UI: place cards into numbered slots, then check the order.
// Used for sequences — developing a film, shutting down a boiler, reconstructing a night.

import { Modal } from './modal.js';
import { el, inline } from './dom.js';

export class OrderPuzzle extends Modal {
  /**
   * @param {object} o
   *  title, intro (inline markup), cards: { id, label, detail? }[], slotLabels?: string[],
   *  initial?: string[] (card ids already placed),
   *  onSubmit(order: string[]) => { ok, message?, red? } | Promise<...>
   */
  constructor(ui, o, { audio }) {
    super(ui, { className: 'order-modal', label: o.title });
    this.o = o;
    this.audio = audio;
    const n = o.slotLabels?.length || o.cards.length;
    this.slots = Array.from({ length: n }, (_, i) => o.initial?.[i] || null);
    this.busy = false;
  }

  mount() {
    const o = this.o;
    this.cardsEl = el('div', { class: 'order-cards', role: 'list', 'aria-label': 'Cards to place' });
    this.slotsEl = el('ol', { class: 'order-slots', 'aria-label': 'Order' });
    this.messageEl = el('p', { class: 'lock-message', 'aria-live': 'assertive' });
    this.redEl = el('div', { class: 'lock-red' });
    this.el.append(
      el('div', { class: 'lock-wrap order-wrap' }, [
        el('h2', { class: 'lock-title', text: o.title }),
        o.intro ? el('p', { class: 'order-intro' }, [inline(o.intro)]) : null,
        el('div', { class: 'order-body' }, [this.cardsEl, this.slotsEl]),
        this.redEl,
        this.messageEl,
        el('p', { class: 'lock-help', text: 'Click a card to place it in the next empty slot · click a slot to take it back · E / Enter to check · Esc to step back' }),
        el('div', { class: 'lock-actions' }, [
          el('button', { class: 'ink-btn', text: 'Check the order', onclick: () => this.submit() }),
          el('button', { class: 'ink-btn ghost', text: 'Clear', onclick: () => this.clear() }),
          el('button', { class: 'ink-btn ghost', text: 'Step back', onclick: () => this.close(false) }),
        ]),
      ]),
    );
    this.render();
  }

  focusFirst() {
    const wrap = this.el.querySelector('.lock-wrap');
    wrap.tabIndex = -1;
    wrap.focus({ preventScroll: true });
  }

  render() {
    const placed = new Set(this.slots.filter(Boolean));
    this.cardsEl.replaceChildren(
      ...this.o.cards.map((c) =>
        el(
          'button',
          {
            class: `order-card${placed.has(c.id) ? ' used' : ''}`,
            role: 'listitem',
            disabled: placed.has(c.id),
            onclick: () => this.place(c.id),
          },
          [el('span', { class: 'order-card-label' }, [inline(c.label)]), c.detail ? el('span', { class: 'order-card-detail' }, [inline(c.detail)]) : null],
        ),
      ),
    );
    this.slotsEl.replaceChildren(
      ...this.slots.map((id, i) => {
        const card = this.o.cards.find((c) => c.id === id);
        return el('li', {}, [
          el(
            'button',
            { class: `order-slot${card ? ' filled' : ''}`, onclick: () => this.unplace(i), 'aria-label': `Slot ${i + 1}${card ? `: ${card.label}` : ', empty'}` },
            [el('span', { class: 'order-slot-n', text: this.o.slotLabels?.[i] || `${i + 1}.` }), card ? el('span', {}, [inline(card.label)]) : el('span', { class: 'order-empty', text: '—' })],
          ),
        ]);
      }),
    );
  }

  place(id) {
    if (this.busy) return;
    const i = this.slots.indexOf(null);
    if (i < 0) return;
    this.slots[i] = id;
    this.audio.play('paper', { volume: 0.5 });
    this.render();
  }

  unplace(i) {
    if (this.busy || !this.slots[i]) return;
    this.slots[i] = null;
    this.audio.play('click', { volume: 0.5 });
    this.render();
  }

  clear() {
    this.slots = this.slots.map(() => null);
    this.render();
  }

  async submit() {
    if (this.busy) return;
    if (this.slots.includes(null)) {
      this.messageEl.textContent = 'Fill every slot first.';
      return;
    }
    this.busy = true;
    let result;
    try {
      result = await this.o.onSubmit([...this.slots]);
    } catch (err) {
      console.error('[orderPuzzle] submit failed', err);
      result = { ok: false };
    }
    if (this.closed) return;
    if (result?.ok) {
      this.messageEl.textContent = result.message || 'That’s it.';
      this.audio.play('solve');
      setTimeout(() => this.close(true), 1100);
      return;
    }
    this.audio.play('wrong');
    this.messageEl.textContent = result?.message || 'Not like that.';
    if (result?.red) {
      const p = el('p', { class: 'red-pen scrawl' }, [inline(result.red)]);
      this.redEl.replaceChildren(p);
      this.audio.play('pen', { volume: 0.7 });
      requestAnimationFrame(() => p.classList.add('shown'));
    }
    this.busy = false;
  }

  onAction(action) {
    if (action === 'pause') this.close(false);
    else if (action === 'interact') this.submit();
    return true;
  }

  onKey({ code }) {
    const m = /^(?:Digit|Numpad)(\d)$/.exec(code);
    if (m) {
      const card = this.o.cards[Number(m[1]) - 1];
      if (card && !this.slots.includes(card.id)) this.place(card.id);
    } else if (code === 'Backspace') {
      const last = this.slots.map((s, i) => (s ? i : -1)).filter((i) => i >= 0).pop();
      if (last !== undefined) this.unplace(last);
    }
  }
}
