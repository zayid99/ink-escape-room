// Interaction: decides which hotspot is in focus (nearest to the player, or under the
// mouse), builds its prompt, and runs it when the player interacts or clicks.
//
// Hotspot shape (declared in room content):
//   { id, label, verb?, x, y, w, h, approachX?, reach?,
//     enabled?(state, g) => bool, onInteract(g) => Promise, onUse?(g, itemId) => Promise<bool> }

const DEFAULT_REACH = 46;

export class Interaction {
  constructor(game) {
    this.game = game;
    this.focus = null;
    this.focusId = null;
    this.appear = 0;
    this.hovered = null;
  }

  enabledHotspots() {
    const g = this.game;
    return (g.room.hotspots || []).filter((h) => !h.enabled || h.enabled(g.state, g));
  }

  /** Smallest enabled hotspot under a world point (so a clock on a desk beats the desk). */
  hotspotAt(x, y, list = this.enabledHotspots()) {
    let best = null;
    for (const h of list) {
      if (x >= h.x - 4 && x <= h.x + h.w + 4 && y >= h.y - 4 && y <= h.y + h.h + 4) {
        if (!best || h.w * h.h < best.w * best.h) best = h;
      }
    }
    return best;
  }

  approachX(h) {
    const room = this.game.room;
    const x = h.approachX ?? h.x + h.w / 2;
    return Math.max(room.bounds.min, Math.min(room.bounds.max, x));
  }

  inReach(h) {
    const reach = h.reach ?? Math.max(DEFAULT_REACH, h.w / 2 + 20);
    return Math.abs(this.approachX(h) - this.game.player.x) <= reach;
  }

  update(dt, pointerWorld) {
    const g = this.game;
    const list = this.enabledHotspots();
    this.hovered = pointerWorld ? this.hotspotAt(pointerWorld.x, pointerWorld.y, list) : null;
    let near = null;
    let bestD = Infinity;
    for (const h of list) {
      if (!this.inReach(h)) continue;
      const d = Math.abs(this.approachX(h) - g.player.x) + (h.priority ? -20 : 0);
      if (d < bestD) {
        bestD = d;
        near = h;
      }
    }
    const h = this.hovered || near;
    if (!h || g.busy || g.ui.blocking()) {
      this.focus = null;
      this.focusId = null;
      return;
    }
    if (h.id !== this.focusId) {
      this.focusId = h.id;
      this.appear = 0;
    }
    this.appear = Math.min(1, this.appear + dt * 3);
    const held = g.inventory.held ? g.items[g.inventory.held] : null;
    const st = g.state;
    const label = typeof h.label === 'function' ? h.label(st) : h.label;
    const baseVerb = typeof h.verb === 'function' ? h.verb(st) : h.verb;
    const verb = held ? `Use ${held.name} on` : baseVerb || 'Inspect';
    const reachable = this.inReach(h);
    this.focus = {
      hotspot: h,
      label: `${verb} ${label}`,
      keyHint: reachable ? (g.touchMode ? 'Tap' : 'E') : g.touchMode ? 'Tap' : 'Click',
      appear: this.appear,
    };
  }

  /** E / Space: act on the nearest hotspot within reach. */
  interactNearest() {
    const f = this.focus;
    if (!f) return;
    const h = f.hotspot;
    if (this.inReach(h)) this.game.runHotspot(h);
    else this.walkThen(h);
  }

  walkThen(h) {
    const g = this.game;
    g.player.walkTo(this.approachX(h), () => {
      if (!g.busy && !g.ui.blocking()) g.runHotspot(h);
    });
  }

  /** Click/tap in the world: on a hotspot → walk there and use it; elsewhere → walk. */
  click(worldX, worldY) {
    const g = this.game;
    const h = this.hotspotAt(worldX, worldY);
    if (h) {
      if (this.inReach(h)) g.runHotspot(h);
      else this.walkThen(h);
      return;
    }
    if (worldY > 150) g.player.walkTo(Math.max(g.room.bounds.min, Math.min(g.room.bounds.max, worldX)));
  }
}
