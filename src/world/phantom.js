// The tall man. He is never drawn — he is the shape where the ink isn't.
//
// A sighting is summoned by content. He waits until the player is facing away,
// fades in, and is "caught" if the torch finds him: then he is simply gone.
// If never caught, he fades on his own. He never moves and never touches anyone.

import { PAPER_LIGHT, INK } from '../render/ink.js';
import { angleDelta, clamp01 } from '../core/math.js';

export class Phantom {
  constructor(game) {
    this.game = game;
    this.active = null;
  }

  /**
   * @param {{ x:number, footY:number, height?:number, linger?:number, delay?:number,
   *           onCaught?:()=>void, onGone?:()=>void }} o
   */
  summon(o) {
    this.active = { height: 150, linger: 7, delay: 0.6, ...o, phase: 'waiting', alpha: 0, timer: 0, seenFor: 0 };
  }

  clear() {
    this.active = null;
  }

  get visible() {
    return !!this.active && this.active.alpha > 0.05;
  }

  update(dt, player, flashlightOn) {
    const p = this.active;
    if (!p) return;
    p.timer += dt;
    const facingAway = Math.sign(p.x - player.x) !== player.facing;
    if (p.phase === 'waiting') {
      if (p.timer > p.delay && facingAway) {
        p.phase = 'visible';
        p.timer = 0;
      }
      return;
    }
    if (p.phase === 'visible') {
      p.alpha = Math.min(1, p.alpha + dt * 2.2);
      const midY = p.footY - p.height * 0.55;
      const { hx, hy, ang } = player.hand;
      const dist = Math.hypot(p.x - hx, midY - hy);
      const inCone = flashlightOn && Math.abs(angleDelta(ang, Math.atan2(midY - hy, p.x - hx))) < 0.3 && dist < 400;
      if (inCone && p.alpha > 0.4) {
        p.seenFor += dt;
        if (p.seenFor > 0.12) {
          p.phase = 'caught';
          p.timer = 0;
          p.onCaught?.();
        }
      }
      if (Math.abs(player.x - p.x) < 90 || p.timer > p.linger) {
        p.phase = 'fading';
        p.timer = 0;
      }
      return;
    }
    // caught (snap away) or fading (slow)
    p.alpha -= dt * (p.phase === 'caught' ? 6 : 0.8);
    if (p.alpha <= 0) {
      const gone = p.phase === 'fading' ? p.onGone : null;
      this.active = null;
      gone?.();
    }
  }

  path(c) {
    const p = this.active;
    const { x, footY: F, height: H } = p;
    const headR = 8;
    const top = F - H;
    c.beginPath();
    c.arc(x, top + headR, headR, 0, Math.PI * 2);
    c.moveTo(x - 11, top + headR * 2 + 6);
    c.quadraticCurveTo(x, top + headR * 2 - 2, x + 11, top + headR * 2 + 6);
    c.lineTo(x + 9, F);
    c.lineTo(x - 9, F);
    c.closePath();
  }

  /** The visible part: a paper-coloured hole in the hatching, with the faintest outline. */
  draw(pen) {
    const p = this.active;
    if (!p || p.alpha <= 0) return;
    const c = pen.ctx;
    const a = clamp01(p.alpha);
    c.save();
    c.globalAlpha = a;
    c.fillStyle = PAPER_LIGHT;
    this.path(c);
    c.fill();
    c.restore();
    pen.begin('phantom');
    pen.circle(p.x, p.footY - p.height + 8, 8.5, { w: 0.6, alpha: 0.4 * a, col: INK });
  }

  /** Called while building the darkness mask so the gap reads even in the dark. */
  cutLight(sh) {
    const p = this.active;
    if (!p || p.alpha <= 0) return;
    sh.save();
    sh.globalAlpha = 0.7 * clamp01(p.alpha);
    sh.fillStyle = '#000';
    this.path(sh);
    sh.fill();
    sh.restore();
  }
}
