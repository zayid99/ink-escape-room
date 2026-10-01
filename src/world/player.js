// The protagonist: a procedural ink rig. Position, lean, bob and torch aim are all
// smoothed every frame (60 fps); only the line jitter is quantised to the boil tick.

import { damp, dampAngle, clamp } from '../core/math.js';
import { INK, PAPER_LIGHT } from '../render/ink.js';

const WALK_SPEED = 92; // logical px / s
const STRIDE = 26; // px per step

export class Player {
  constructor(bus) {
    this.bus = bus;
    this.x = 300;
    this.footY = 304;
    this.vx = 0;
    this.facing = 1;
    this.walkPhase = 0;
    this.stepCount = 0;
    this.target = null; // auto-walk destination x
    this.onArrive = null;
    this.aimAngle = 0.15;
    this.hand = { hx: 0, hy: 0, ang: 0.15 };
    this.lean = 0;
    this.frozen = false;
  }

  place(x, facing = this.facing) {
    this.x = x;
    this.vx = 0;
    this.facing = facing;
    this.target = null;
    this.onArrive = null;
    this.walkPhase = 0;
  }

  walkTo(x, onArrive = null) {
    this.target = x;
    this.onArrive = onArrive;
  }

  cancelWalk() {
    this.target = null;
    this.onArrive = null;
  }

  /**
   * @param {number} dt
   * @param {number} axis -1/0/1 from keyboard
   * @param {{min:number,max:number}} bounds
   * @param {{x:number,y:number}|null} aimWorld torch target in world space, or null
   */
  update(dt, axis, bounds, aimWorld) {
    let dir = this.frozen ? 0 : axis;
    if (dir !== 0) this.cancelWalk();
    if (!this.frozen && this.target !== null) {
      const dx = this.target - this.x;
      if (Math.abs(dx) < 3) {
        const cb = this.onArrive;
        this.target = null;
        this.onArrive = null;
        dir = 0;
        if (cb) cb();
      } else dir = Math.sign(dx);
    }

    const targetV = dir * WALK_SPEED;
    this.vx = damp(this.vx, targetV, dir === 0 ? 14 : 7, dt);
    if (Math.abs(this.vx) < 0.5 && dir === 0) this.vx = 0;
    const raw = this.x + this.vx * dt;
    const nx = clamp(raw, bounds.min, bounds.max);
    if (nx !== raw) {
      this.vx = 0;
      if (this.target !== null) this.target = clamp(this.target, bounds.min, bounds.max);
    }
    this.x = nx;

    const speed = Math.abs(this.vx);
    const prevPhase = this.walkPhase;
    this.walkPhase += (speed * dt) / STRIDE;
    if (Math.floor(this.walkPhase) !== Math.floor(prevPhase) && speed > 25) this.bus.emit('player:step', { x: this.x });

    if (speed > 6) this.facing = Math.sign(this.vx);
    else if (aimWorld) this.facing = aimWorld.x >= this.x ? 1 : -1;
    this.lean = damp(this.lean, (this.vx / WALK_SPEED) * 0.06, 6, dt);

    // Torch aim: cursor if the mouse is in use, otherwise along facing, slightly down.
    const shX = this.x + this.facing * 3;
    const shY = this.footY - 58 + this.bob();
    let target;
    if (aimWorld) target = Math.atan2(aimWorld.y - shY, aimWorld.x - shX);
    else target = this.facing > 0 ? 0.12 : Math.PI - 0.12;
    // Keep the arm on the side the player faces.
    if (aimWorld) {
      const facingRight = this.facing > 0;
      const cos = Math.cos(target);
      if (facingRight && cos < -0.2) target = Math.atan2(Math.sin(target), 0.2);
      if (!facingRight && cos > 0.2) target = Math.atan2(Math.sin(target), -0.2);
    }
    this.aimAngle = dampAngle(this.aimAngle, target, 12, dt);
    this.hand = {
      hx: shX + Math.cos(this.aimAngle) * 16,
      hy: shY + Math.sin(this.aimAngle) * 12,
      ang: this.aimAngle,
      shX,
      shY,
    };
  }

  bob() {
    const walking = Math.abs(this.vx) > 6;
    return walking ? -Math.abs(Math.sin(this.walkPhase * Math.PI)) * 2.4 : Math.sin(performance.now() / 500) * 0.8;
  }

  /** @param {import('../render/ink.js').Pen} pen */
  draw(pen) {
    const c = pen.ctx;
    const x = this.x;
    const F = this.footY;
    const b = this.bob();
    const speedK = Math.min(1, Math.abs(this.vx) / WALK_SPEED);
    const swing = Math.sin(this.walkPhase * Math.PI) * 0.5 * speedK;
    const lean = this.lean * this.facing;

    c.save();
    c.translate(x, F);
    c.rotate(this.lean);
    c.translate(-x, -F);

    // Shadow on the floorboards.
    pen.begin('player-shadow');
    pen.fillEllipse(x, F + 1, 18, 3.5, 'rgba(31,27,26,0.35)');

    // Legs.
    pen.begin('player-legs');
    const hipY = F - 32 + b;
    for (const s of [swing, -swing]) {
      const fx = x + Math.sin(s) * 18;
      const fy = hipY + Math.cos(s) * 32;
      pen.line(x, hipY, fx, Math.min(F, fy), { w: 2.8, j: 0.6 });
      pen.line(fx, Math.min(F, fy), fx + this.facing * 5, Math.min(F, fy), { w: 2.4, j: 0.4 });
    }

    // Coat: filled ink with a trailing hem.
    pen.begin('player-coat');
    const trail = -this.vx * 0.05;
    const top = F - 66 + b;
    const bottom = F - 20 + b;
    c.fillStyle = INK;
    c.beginPath();
    c.moveTo(x - 8 + pen.J(0.5), top);
    c.lineTo(x + 8 + pen.J(0.5), top);
    c.lineTo(x + 13 + trail + pen.J(0.7), bottom + pen.J(0.5));
    c.lineTo(x + 2 + trail * 0.5, bottom + 3);
    c.lineTo(x - 13 + trail + pen.J(0.7), bottom + pen.J(0.5));
    c.closePath();
    c.fill();
    // Collar line catches the light.
    pen.line(x - 5, top + 4, x + this.facing * 2, top + 12, { col: PAPER_LIGHT, w: 0.8, passes: 1, alpha: 0.5 });

    // Head: paper disc, outline, hatched hair.
    pen.begin('player-head');
    const hx = x + this.facing * 1.2 + lean * 10;
    const hy = F - 78 + b;
    pen.fillEllipse(hx, hy, 8.8, 9.2, PAPER_LIGHT);
    pen.circle(hx, hy, 9.2, { w: 1.2 });
    c.save();
    c.beginPath();
    c.arc(hx - this.facing * 0.8, hy - 1, 10, Math.PI, Math.PI * 2);
    c.lineTo(hx - this.facing * 10, hy + 9);
    c.closePath();
    c.clip();
    pen.hatch(hx - 11, hy - 11, 22, 12, { gap: 2.2, dir: this.facing, w: 0.8, alpha: 1 });
    c.restore();
    // Hair falls behind the head on the trailing side.
    pen.line(hx - this.facing * 8, hy - 4, hx - this.facing * 11, hy + 10, { w: 1.2 });

    c.restore();

    // Arm + torch.
    pen.begin('player-arm');
    const { hx: tx, hy: ty, ang, shX, shY } = this.hand;
    pen.line(shX, shY, tx, ty, { w: 3, j: 0.5 });
    pen.line(tx, ty, tx + Math.cos(ang) * 8, ty + Math.sin(ang) * 8, { w: 3.6, j: 0.3 });
  }
}
