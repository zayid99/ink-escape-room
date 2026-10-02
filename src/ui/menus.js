// Main menu, pause menu, settings and confirmation dialogs.

import { Modal } from './modal.js';
import { el } from './dom.js';

const CONTROLS = [
  ['A / D or ← / →', 'Walk'],
  ['Mouse', 'Aim the torch · click to walk / interact'],
  ['E · Space · Enter', 'Interact · advance text'],
  ['I or Tab', 'Pockets (inventory)'],
  ['J', 'Journal & clues'],
  ['Q · right-click', 'Put away held item'],
  ['F', 'Torch on / off'],
  ['Esc or P', 'Pause'],
];

function controlsTable() {
  return el(
    'table',
    { class: 'controls-table' },
    CONTROLS.map(([k, v]) => el('tr', {}, [el('th', { text: k }), el('td', { text: v })])),
  );
}

function menuButton(label, onclick, opts = {}) {
  return el('button', { class: `menu-btn${opts.danger ? ' danger' : ''}`, text: label, onclick, disabled: opts.disabled, autofocus: opts.autofocus });
}

export class MainMenu extends Modal {
  constructor(ui, { canContinue, saveInfo, onContinue, onNew, onSettings }) {
    super(ui, { className: 'main-menu', closeOnEsc: false, label: 'Main menu' });
    this.o = { canContinue, saveInfo, onContinue, onNew, onSettings };
  }

  mount() {
    const o = this.o;
    const list = el('div', { class: 'menu-list' }, [
      menuButton('Continue', () => o.onContinue(), { disabled: !o.canContinue, autofocus: o.canContinue }),
      o.saveInfo ? el('p', { class: 'menu-saveinfo', text: o.saveInfo }) : null,
      menuButton('New Game', () => o.onNew(), { autofocus: !o.canContinue }),
      menuButton('Settings', () => o.onSettings()),
      menuButton('Controls', () => this.ui.open(new InfoPanel(this.ui, 'Controls', [controlsTable(), el('p', { class: 'doc-meta', text: 'Headphones recommended. Best played in the dark.' })]))),
    ]);
    this.el.append(
      el('div', { class: 'menu-panel' }, [
        el('p', { class: 'menu-eyebrow', text: 'a journal in ink' }),
        el('h1', { class: 'menu-title', text: 'Marginalia' }),
        el('p', { class: 'menu-tag red-pen', text: 'Don’t trust the clocks. Don’t trust me either.' }),
        list,
        el('p', { class: 'menu-foot', text: 'Four chapters · Progress saves automatically' }),
      ]),
    );
  }

  onAction() {
    return true;
  }
}

export class PauseMenu extends Modal {
  constructor(ui, handlers) {
    super(ui, { className: 'pause-menu', label: 'Paused' });
    this.h = handlers;
  }

  mount() {
    const h = this.h;
    this.status = el('p', { class: 'menu-saveinfo', 'aria-live': 'polite', text: h.saveInfo || '' });
    this.el.append(
      el('div', { class: 'menu-panel small' }, [
        el('h2', { class: 'menu-h', text: 'Paused' }),
        el('div', { class: 'menu-list' }, [
          menuButton('Resume', () => this.close('resume'), { autofocus: true }),
          menuButton('Journal', () => h.onJournal()),
          menuButton('Pockets', () => h.onInventory()),
          menuButton('Save game', () => {
            const ok = h.onSave();
            this.status.textContent = ok ? 'Saved.' : 'Couldn’t save — browser storage is unavailable.';
          }),
          menuButton('Load last save', () => h.onLoad(), { disabled: !h.canLoad }),
          menuButton('Settings', () => h.onSettings()),
          menuButton('Restart chapter', () => h.onRestart(), { danger: true }),
          menuButton('Quit to menu', () => h.onQuit(), { danger: true }),
        ]),
        this.status,
      ]),
    );
  }

  onAction(action) {
    if (action === 'pause') this.close('resume');
    return true;
  }
}

export class InfoPanel extends Modal {
  constructor(ui, title, children) {
    super(ui, { className: 'info-panel', label: title });
    this.title = title;
    this.children = children;
  }

  mount() {
    this.el.append(
      el('div', { class: 'menu-panel small' }, [
        el('h2', { class: 'menu-h', text: this.title }),
        ...this.children,
        el('div', { class: 'menu-list' }, [menuButton('Back', () => this.close(null), { autofocus: true })]),
      ]),
    );
  }
}

export class ConfirmDialog extends Modal {
  constructor(ui, { title, text, yes = 'Yes', no = 'Cancel' }) {
    super(ui, { className: 'confirm', label: title });
    this.o = { title, text, yes, no };
  }

  mount() {
    this.el.append(
      el('div', { class: 'menu-panel small' }, [
        el('h2', { class: 'menu-h', text: this.o.title }),
        el('p', { class: 'menu-text', text: this.o.text }),
        el('div', { class: 'menu-row' }, [
          menuButton(this.o.yes, () => this.close(true), { danger: true }),
          menuButton(this.o.no, () => this.close(false), { autofocus: true }),
        ]),
      ]),
    );
  }

  onAction(action) {
    if (action === 'pause') this.close(false);
    return true;
  }
}

export class SettingsPanel extends Modal {
  constructor(ui, { settings, onClearSave, hasSave }) {
    super(ui, { className: 'settings', label: 'Settings' });
    this.settings = settings;
    this.onClearSave = onClearSave;
    this.hasSave = hasSave;
  }

  slider(key, label, { min = 0, max = 1, step = 0.05, format = (v) => `${Math.round(v * 100)}%` } = {}) {
    const id = `set-${key}`;
    const out = el('output', { for: id, text: format(this.settings.get(key)) });
    const input = el('input', { id, type: 'range', min, max, step, value: this.settings.get(key) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      this.settings.set(key, v);
      out.textContent = format(v);
    });
    return el('div', { class: 'set-row' }, [el('label', { for: id, text: label }), input, out]);
  }

  mount() {
    const s = this.settings;
    const speed = el('select', { id: 'set-textSpeed' }, [
      ['Slow', 25],
      ['Normal', 45],
      ['Fast', 90],
      ['Instant', 0],
    ].map(([label, v]) => el('option', { value: v, text: label, selected: s.get('textSpeed') === v })));
    speed.addEventListener('change', () => s.set('textSpeed', Number(speed.value)));

    const flicker = el('input', { id: 'set-flicker', type: 'checkbox', checked: s.get('reduceFlicker') });
    flicker.addEventListener('change', () => s.set('reduceFlicker', flicker.checked));

    const fsBtn = menuButton(document.fullscreenElement ? 'Exit full screen' : 'Full screen', () => {
      const req = document.documentElement.requestFullscreen;
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      else req?.call(document.documentElement).catch(() => {});
      setTimeout(() => (fsBtn.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'), 200);
    });
    fsBtn.hidden = !document.documentElement.requestFullscreen;

    this.clearStatus = el('p', { class: 'menu-saveinfo', 'aria-live': 'polite' });
    const clearBtn = menuButton(
      'Delete saved game',
      async () => {
        const ok = await this.ui.open(new ConfirmDialog(this.ui, { title: 'Delete save?', text: 'Your saved progress will be erased. This can’t be undone.', yes: 'Delete' }));
        if (ok) {
          this.onClearSave();
          this.clearStatus.textContent = 'Saved game deleted.';
          clearBtn.disabled = true;
        }
      },
      { danger: true, disabled: !this.hasSave },
    );

    this.el.append(
      el('div', { class: 'menu-panel wide' }, [
        el('h2', { class: 'menu-h', text: 'Settings' }),
        el('div', { class: 'set-grid' }, [
          this.slider('masterVolume', 'Master volume'),
          this.slider('musicVolume', 'Music'),
          this.slider('ambienceVolume', 'Ambience'),
          this.slider('sfxVolume', 'Effects'),
          this.slider('lineBoil', 'Line boil', { format: (v) => (v === 0 ? 'Still' : `${Math.round(v * 100)}%`) }),
          el('div', { class: 'set-row' }, [el('label', { for: 'set-textSpeed', text: 'Text speed' }), speed, el('span')]),
          el('div', { class: 'set-row' }, [el('label', { for: 'set-flicker', text: 'Reduce flicker & shake' }), flicker, el('span')]),
        ]),
        el('div', { class: 'menu-row' }, [fsBtn, clearBtn]),
        this.clearStatus,
        el('div', { class: 'menu-list' }, [menuButton('Back', () => this.close(null), { autofocus: true })]),
      ]),
    );
  }
}

export { controlsTable };
