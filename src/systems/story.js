// Story progression: flags, discovered clues, journal pages and the current objective.
// Content scripts call these through the Game facade (g.flag, g.addClue, ...).

export class Story {
  constructor(game, { clues, journal }) {
    this.game = game;
    this.clueDefs = clues;
    this.journalDefs = journal;
    this.unread = new Set();
  }

  get state() {
    return this.game.state;
  }

  flag(name) {
    return !!this.state.flags[name];
  }

  setFlag(name, value = true) {
    if (this.state.flags[name] === value) return;
    this.state.flags[name] = value;
    this.game.changed();
  }

  hasClue(id) {
    return this.state.clues.includes(id);
  }

  /** Record a clue in the journal. Returns true if it was new. */
  addClue(id, { silent = false } = {}) {
    const def = this.clueDefs[id];
    if (!def) {
      console.error(`[story] unknown clue "${id}"`);
      return false;
    }
    if (this.hasClue(id)) return false;
    this.state.clues.push(id);
    this.game.changed();
    if (!silent) {
      this.game.ui.toast(`Noted in journal — ${def.title}`, { red: true });
      this.game.audio.play('pen', { volume: 0.5 });
    }
    return true;
  }

  hasEntry(id) {
    return this.state.journal.includes(id);
  }

  addEntry(id, { silent = false } = {}) {
    if (!this.journalDefs[id]) {
      console.error(`[story] unknown journal entry "${id}"`);
      return false;
    }
    if (this.hasEntry(id)) return false;
    this.state.journal.push(id);
    this.unread.add(id);
    this.game.changed();
    if (!silent) this.game.ui.toast(`New journal page — ${this.journalDefs[id].title}`);
    return true;
  }

  setObjective(text) {
    if (this.state.objective === text) return;
    this.state.objective = text;
    this.game.hud.setObjective(text);
    this.game.changed();
  }

  /** Data for the journal panel. Entries keep the order they were added. */
  journalView() {
    const st = this.state;
    return {
      entries: st.journal
        .map((id) => {
          const def = this.journalDefs[id];
          if (!def) return null;
          return {
            id,
            title: def.title,
            date: def.date,
            old: def.old,
            unread: this.unread.has(id),
            blocks: typeof def.blocks === 'function' ? def.blocks(st) : def.blocks,
          };
        })
        .filter(Boolean),
      clues: st.clues.map((id) => ({ id, ...this.clueDefs[id] })).filter((c) => c.title),
      objective: st.objective,
    };
  }

  markRead(id) {
    this.unread.delete(id);
  }
}
