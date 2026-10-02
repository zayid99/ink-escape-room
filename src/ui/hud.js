// In-world HUD: objective scrap, held item, and buttons for mouse/touch players.
// Kept deliberately minimal so it doesn't break immersion.

import { el, inline } from './dom.js';

export class HUD {
  constructor(layer, { onJournal, onInventory, onPause, onPutAway }) {
    this.objectiveEl = el('div', { class: 'hud-objective', 'aria-live': 'polite' });
    this.heldEl = el('button', { class: 'hud-held', hidden: true, title: 'Put away (Q / right-click)', onclick: (e) => blurThen(e, onPutAway) });
    const btn = (label, title, fn) => el('button', { class: 'hud-btn', 'aria-label': title, title, text: label, onclick: (e) => blurThen(e, fn) });
    this.buttons = el('div', { class: 'hud-buttons' }, [btn('Journal', 'Journal (J)', onJournal), btn('Pockets', 'Pockets (I)', onInventory), btn('❚❚', 'Pause (Esc)', onPause)]);
    this.hintEl = el('div', { class: 'hud-hint' });
    this.meterEl = el('div', { class: 'hud-meter', hidden: true, 'aria-live': 'off' });
    this.root = el('div', { class: 'hud', hidden: true }, [this.objectiveEl, this.buttons, this.heldEl, this.hintEl, this.meterEl]);
    layer.append(this.root);
    this.objectiveTimer = null;
  }

  show(v) {
    this.root.hidden = !v;
  }

  setObjective(text, { flash = true } = {}) {
    this.objectiveEl.replaceChildren();
    if (!text) return;
    this.objectiveEl.append(el('span', { class: 'hud-obj-arrow', text: '→ ' }), inline(text));
    if (flash) {
      this.objectiveEl.classList.add('fresh');
      clearTimeout(this.objectiveTimer);
      this.objectiveTimer = setTimeout(() => this.objectiveEl.classList.remove('fresh'), 6000);
    }
  }

  setHeld(item) {
    this.heldEl.hidden = !item;
    if (item) this.heldEl.textContent = `Holding: ${item.name}  ✕`;
  }

  /** A small instrument readout (the CO alarm). Pass null to hide it. */
  setMeter(text, alarm = false) {
    if (text === this.meterText && alarm === this.meterAlarm) return;
    this.meterText = text;
    this.meterAlarm = alarm;
    this.meterEl.hidden = text === null;
    if (text !== null) this.meterEl.textContent = text;
    this.meterEl.classList.toggle('alarm', alarm);
  }

  hint(text, ms = 7000) {
    this.hintEl.textContent = text;
    this.hintEl.classList.add('shown');
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => this.hintEl.classList.remove('shown'), ms);
  }
}

function blurThen(e, fn) {
  e.currentTarget.blur();
  fn();
}
