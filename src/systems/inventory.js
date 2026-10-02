// Inventory system: ordered item ids in game state, the currently held item, and
// item combinations declared in the item registry.

export class Inventory {
  constructor(game, registry) {
    this.game = game;
    this.registry = registry;
    this.held = null;
  }

  get ids() {
    return this.game.state.inventory;
  }

  has(id) {
    return this.ids.includes(id);
  }

  add(id) {
    if (!this.registry[id]) {
      console.error(`[inventory] unknown item "${id}"`);
      return false;
    }
    if (this.has(id)) return false;
    this.ids.push(id);
    this.game.changed();
    return true;
  }

  remove(id) {
    const i = this.ids.indexOf(id);
    if (i < 0) return false;
    this.ids.splice(i, 1);
    if (this.held === id) this.hold(null);
    this.game.changed();
    return true;
  }

  hold(id) {
    this.held = id && this.has(id) ? id : null;
    this.game.hud.setHeld(this.held ? this.registry[this.held] : null);
  }

  /** Look up a combination recipe in either order. */
  findCombo(a, b) {
    const A = this.registry[a];
    const B = this.registry[b];
    return A?.combine?.[b] || B?.combine?.[a] || null;
  }
}
