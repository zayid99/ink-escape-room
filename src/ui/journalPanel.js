// The journal: the protagonist's pages (and the older pages that came before her),
// plus the list of clues she has noted. Open with J.

import { Modal } from './modal.js';
import { el, inline } from './dom.js';
import { renderBlocks } from './blocks.js';

export class JournalPanel extends Modal {
  /**
   * deps: { entries: {id,title,date?,old?,blocks}[], clues: {id,title,text}[], objective, boil, startEntry?, onRead(id) }
   */
  constructor(ui, deps) {
    super(ui, { className: 'journal-modal', label: 'Journal' });
    this.deps = deps;
    this.tab = 'pages';
    const ids = deps.entries.map((e) => e.id);
    this.current = deps.startEntry && ids.includes(deps.startEntry) ? deps.startEntry : ids[ids.length - 1];
    this.disposePage = null;
  }

  mount() {
    this.tabsEl = el('div', { class: 'jr-tabs', role: 'tablist' });
    this.listEl = el('div', { class: 'jr-list' });
    this.pageEl = el('div', { class: 'jr-page', tabindex: '0' });
    const close = el('button', { class: 'ink-btn small', text: 'Close', onclick: () => this.close(null) });
    this.el.append(
      el('div', { class: 'jr-book' }, [
        el('section', { class: 'jr-left' }, [
          el('header', { class: 'jr-head' }, [el('h2', { text: 'Journal' }), close]),
          this.deps.objective ? el('p', { class: 'jr-objective' }, [el('span', { text: 'Now: ' }), inline(this.deps.objective)]) : null,
          this.tabsEl,
          this.listEl,
        ]),
        el('section', { class: 'jr-right' }, [this.pageEl]),
      ]),
    );
    this.render();
  }

  render() {
    this.tabsEl.replaceChildren(
      ...[
        ['pages', `Pages (${this.deps.entries.length})`],
        ['clues', `Clues (${this.deps.clues.length})`],
      ].map(([id, label]) =>
        el('button', {
          class: `jr-tab${this.tab === id ? ' active' : ''}`,
          role: 'tab',
          'aria-selected': this.tab === id ? 'true' : 'false',
          text: label,
          onclick: () => {
            this.tab = id;
            this.render();
          },
        }),
      ),
    );
    this.listEl.replaceChildren();
    if (this.tab === 'pages') {
      for (const e of this.deps.entries) {
        this.listEl.append(
          el(
            'button',
            {
              class: `jr-entry${e.id === this.current ? ' active' : ''}${e.old ? ' old' : ''}${e.unread ? ' unread' : ''}`,
              onclick: () => {
                this.current = e.id;
                this.render();
              },
            },
            [el('span', { class: 'jr-entry-title', text: e.title }), e.date ? el('span', { class: 'jr-entry-date', text: e.date }) : null],
          ),
        );
      }
      this.renderEntry();
    } else {
      this.disposePage?.();
      this.disposePage = null;
      this.pageEl.replaceChildren();
      if (!this.deps.clues.length) this.pageEl.append(el('p', { class: 'doc-hand', text: 'Nothing yet. Look closer.' }));
      for (const c of [...this.deps.clues].reverse()) {
        this.pageEl.append(el('div', { class: 'jr-clue' }, [el('h4', {}, [inline(c.title)]), el('p', {}, [inline(c.text)])]));
      }
      this.listEl.append(el('p', { class: 'jr-note', text: 'Everything I’ve noticed, newest first. Some of it might even be true.' }));
    }
  }

  renderEntry() {
    this.disposePage?.();
    this.pageEl.replaceChildren();
    const entry = this.deps.entries.find((e) => e.id === this.current);
    if (!entry) return;
    this.deps.onRead?.(entry.id);
    entry.unread = false;
    this.pageEl.classList.toggle('old', !!entry.old);
    this.pageEl.append(el('h3', { class: 'jr-page-title', text: entry.title }));
    if (entry.date) this.pageEl.append(el('p', { class: 'doc-meta', text: entry.date }));
    const { node, dispose } = renderBlocks(entry.blocks, { boil: this.deps.boil });
    this.disposePage = dispose;
    this.pageEl.append(node);
    this.pageEl.scrollTop = 0;
  }

  onAction(action) {
    if (action === 'pause' || action === 'journal') this.close(null);
    return true;
  }

  onKey({ code }) {
    if (this.tab !== 'pages') return;
    const ids = this.deps.entries.map((e) => e.id);
    const i = ids.indexOf(this.current);
    if (code === 'ArrowDown' || code === 'ArrowRight') this.current = ids[Math.min(ids.length - 1, i + 1)];
    else if (code === 'ArrowUp' || code === 'ArrowLeft') this.current = ids[Math.max(0, i - 1)];
    else return;
    this.render();
  }

  dispose() {
    this.disposePage?.();
  }
}
