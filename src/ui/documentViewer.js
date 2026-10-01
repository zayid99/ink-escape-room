// Full-screen document viewer: notes, ledgers, photographs, journal pages.

import { Modal } from './modal.js';
import { el } from './dom.js';
import { renderBlocks } from './blocks.js';

export class DocumentViewer extends Modal {
  /**
   * @param {object} doc { title, kind, pages: Array<Block[] | (state)=>Block[]> }
   */
  constructor(ui, doc, { state, boil, audio }) {
    super(ui, { className: 'doc-modal', label: doc.title || 'Document' });
    this.doc = doc;
    this.state = state;
    this.boil = boil;
    this.audio = audio;
    this.page = 0;
    this.disposePage = null;
  }

  mount() {
    this.sheet = el('article', { class: `doc-sheet kind-${this.doc.kind || 'paper'}` });
    this.counter = el('span', { class: 'doc-counter' });
    this.prevBtn = el('button', { class: 'ink-btn small', text: '◂ Prev', onclick: () => this.turn(-1) });
    this.nextBtn = el('button', { class: 'ink-btn small', text: 'Next ▸', onclick: () => this.turn(1) });
    const closeBtn = el('button', { class: 'ink-btn small', text: 'Close', onclick: () => this.close(true), autofocus: true });
    const nav = el('nav', { class: 'doc-nav' }, [this.prevBtn, this.counter, this.nextBtn, closeBtn]);
    this.el.append(el('div', { class: 'doc-wrap' }, [this.sheet, nav]));
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close(true);
    });
    this.renderPage();
  }

  get pages() {
    return this.doc.pages;
  }

  renderPage() {
    this.disposePage?.();
    this.sheet.replaceChildren();
    const raw = this.pages[this.page];
    const blocks = typeof raw === 'function' ? raw(this.state) : raw;
    if (this.doc.title && this.page === 0) this.sheet.append(el('h2', { class: 'doc-title', text: this.doc.title }));
    const { node, dispose } = renderBlocks(blocks, { boil: this.boil });
    this.disposePage = dispose;
    this.sheet.append(node);
    this.sheet.scrollTop = 0;
    const multi = this.pages.length > 1;
    this.prevBtn.hidden = !multi;
    this.nextBtn.hidden = !multi;
    this.counter.hidden = !multi;
    this.prevBtn.disabled = this.page === 0;
    this.nextBtn.disabled = this.page === this.pages.length - 1;
    this.counter.textContent = `${this.page + 1} / ${this.pages.length}`;
  }

  turn(d) {
    const p = this.page + d;
    if (p < 0 || p >= this.pages.length) return;
    this.page = p;
    this.audio.play('page');
    this.renderPage();
  }

  onAction(action) {
    if (action === 'pause' || action === 'interact') {
      // Interact flips forward through multi-page documents, then closes.
      if (action === 'interact' && this.page < this.pages.length - 1) this.turn(1);
      else this.close(true);
    }
    return true;
  }

  onKey({ code }) {
    if (code === 'ArrowRight') this.turn(1);
    if (code === 'ArrowLeft') this.turn(-1);
  }

  dispose() {
    this.disposePage?.();
  }
}
