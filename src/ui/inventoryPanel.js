// Inventory: a page of taped-in objects. Select one to examine, hold (use) or combine.

import { Modal } from './modal.js';
import { el, inline, sketchCanvas } from './dom.js';

export class InventoryPanel extends Modal {
  /**
   * @param {object} deps { ids: string[], items: registry, boil, onExamine(id), onUse(id), onCombine(a,b) }
   */
  constructor(ui, deps) {
    super(ui, { className: 'inv-modal', label: 'Inventory' });
    this.deps = deps;
    this.selected = deps.ids[0] || null;
    this.combining = null;
    this.disposers = [];
  }

  mount() {
    this.grid = el('div', { class: 'inv-grid', role: 'listbox', 'aria-label': 'Items' });
    this.detail = el('div', { class: 'inv-detail' });
    const close = el('button', { class: 'ink-btn small', text: 'Close', onclick: () => this.close(null) });
    this.el.append(
      el('div', { class: 'inv-sheet' }, [
        el('header', { class: 'inv-head' }, [el('h2', { text: 'Pockets' }), close]),
        el('div', { class: 'inv-body' }, [this.grid, this.detail]),
        el('p', { class: 'inv-help', text: 'Select an item. “Hold” it, then interact with something in the room to use it there.' }),
      ]),
    );
    this.renderGrid();
    this.renderDetail();
  }

  renderGrid() {
    this.disposers.forEach((d) => d());
    this.disposers = [];
    this.grid.replaceChildren();
    const { ids, items, boil } = this.deps;
    if (!ids.length) {
      this.grid.append(el('p', { class: 'inv-empty', text: 'Nothing but lint.' }));
      return;
    }
    for (const id of ids) {
      const item = items[id];
      if (!item) continue;
      const sk = sketchCanvas((pen, w, h) => item.icon(pen, w, h), 72, 72, { boil, label: item.name });
      this.disposers.push(sk.dispose);
      const slot = el(
        'button',
        {
          class: `inv-slot${id === this.selected ? ' selected' : ''}${id === this.combining ? ' combining' : ''}`,
          role: 'option',
          'aria-selected': id === this.selected ? 'true' : 'false',
          'aria-label': item.name,
          onclick: () => this.pick(id),
        },
        [sk.node, el('span', { class: 'inv-name', text: item.name })],
      );
      this.grid.append(slot);
    }
  }

  renderDetail() {
    this.detail.replaceChildren();
    const item = this.deps.items[this.selected];
    if (!item) return;
    const actions = el('div', { class: 'inv-actions' }, [
      el('button', { class: 'ink-btn', text: 'Examine', onclick: () => this.deps.onExamine(this.selected, this) }),
      el('button', { class: 'ink-btn', text: 'Hold', onclick: () => this.hold() }),
      this.deps.ids.length > 1
        ? el('button', {
            class: `ink-btn${this.combining ? ' active' : ''}`,
            text: this.combining ? 'Cancel combine' : 'Combine with…',
            onclick: () => this.toggleCombine(),
          })
        : null,
    ]);
    this.detail.append(
      ...[
        el('h3', { class: 'inv-title', text: item.name }),
        el('p', { class: 'inv-desc' }, [inline(item.desc)]),
        this.combining ? el('p', { class: 'red-pen', text: `Combine ${this.deps.items[this.combining].name} with…?` }) : null,
        actions,
      ].filter(Boolean),
    );
  }

  pick(id) {
    if (this.combining && id !== this.combining) {
      const a = this.combining;
      this.combining = null;
      this.deps.onCombine(a, id, this);
      return;
    }
    this.selected = id;
    this.renderGrid();
    this.renderDetail();
  }

  toggleCombine() {
    this.combining = this.combining ? null : this.selected;
    this.renderGrid();
    this.renderDetail();
  }

  hold() {
    this.deps.onUse(this.selected);
    this.close(this.selected);
  }

  /** Called by the game after a combine/examine changes the item list. */
  refresh(ids) {
    this.deps.ids = ids;
    if (!ids.includes(this.selected)) this.selected = ids[0] || null;
    this.renderGrid();
    this.renderDetail();
  }

  onAction(action) {
    if (action === 'pause' || action === 'inventory') this.close(null);
    return true;
  }

  onKey({ code }) {
    const ids = this.deps.ids;
    if (!ids.length) return;
    const i = ids.indexOf(this.selected);
    if (code === 'ArrowRight') this.pick(ids[(i + 1) % ids.length]);
    if (code === 'ArrowLeft') this.pick(ids[(i - 1 + ids.length) % ids.length]);
  }

  dispose() {
    this.disposers.forEach((d) => d());
  }
}
