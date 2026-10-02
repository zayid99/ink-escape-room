// Canvas renderer. Logical resolution is 640×360; the backing store follows the
// display size × devicePixelRatio (capped) so lines stay crisp on any screen.
//
// Frame composition:
//  1. static room layer (paper + room drawing) — rebuilt only on each boil tick
//  2. dynamic world (moving furniture, annotations, the tall man, the player)
//  3. one "shade" layer — ink-wash darkness + cross-hatching + vignette, with light
//     cut out by candles and the torch — composited with a single multiply
//  4. post-light marks: red-pen annotations, red flame, interaction prompts

import { Pen, RED, PAPER_LIGHT, FONT_HAND } from './ink.js';
import { makePaper } from './paper.js';
import { drawArt } from '../core/assets.js';
import { mulberry32, clamp01 } from '../core/math.js';

export const VIEW_W = 640;
export const VIEW_H = 360;
const MAX_BACKING_W = 1920;
const MIN_QUALITY = 0.5;
/** The darkness layer is soft by nature, so it renders at half resolution and is upscaled. */
const SHADE_RES = 0.5;

export class Renderer {
  constructor(canvas, stageEl) {
    this.canvas = canvas;
    this.stage = stageEl;
    this.ctx = canvas.getContext('2d');
    this.pen = new Pen(this.ctx);
    this.scale = 1;

    this.staticLayer = document.createElement('canvas');
    this.staticPen = new Pen(this.staticLayer.getContext('2d'));
    this.shade = document.createElement('canvas');
    this.hatchPattern = document.createElement('canvas');
    /** Resolution multiplier, lowered automatically on slow devices. */
    this.quality = 1;
    this.staticKey = '';
    this.hatchTick = -1;

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let w = vw;
    let h = (vw * 9) / 16;
    if (h > vh) {
      h = vh;
      w = (vh * 16) / 9;
    }
    w = Math.floor(w);
    h = Math.floor(h);
    this.stage.style.width = `${w}px`;
    this.stage.style.height = `${h}px`;
    const dpr = Math.min(window.devicePixelRatio || 1, 3) * this.quality;
    let bw = Math.round(w * dpr);
    if (bw > MAX_BACKING_W) bw = MAX_BACKING_W;
    const bh = Math.round((bw * 9) / 16);
    this.canvas.width = bw;
    this.canvas.height = bh;
    this.scale = bw / VIEW_W;
    this.shadeScale = this.scale * SHADE_RES;
    for (const c of [this.shade, this.hatchPattern]) {
      c.width = Math.round(bw * SHADE_RES);
      c.height = Math.round(bh * SHADE_RES);
    }
    this.staticKey = '';
    this.hatchTick = -1;
    // Keep the CSS variable in sync so DOM UI can scale with the stage.
    document.documentElement.style.setProperty('--stage-w', `${w}px`);
    document.documentElement.style.setProperty('--stage-h', `${h}px`);
  }

  /** Drop the backing resolution one step (called when frames run long). Returns false at the floor. */
  degrade() {
    if (this.quality <= MIN_QUALITY) return false;
    this.quality = Math.max(MIN_QUALITY, this.quality * 0.8);
    this.resize();
    return true;
  }

  /** Client (CSS pixel) coordinates → logical view coordinates, or null if outside. */
  toLogical(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return null;
    const x = ((clientX - r.left) / r.width) * VIEW_W;
    const y = ((clientY - r.top) / r.height) * VIEW_H;
    if (x < 0 || y < 0 || x > VIEW_W || y > VIEW_H) return null;
    return { x, y };
  }

  /**
   * @param {object} f frame info: { room, state, t, tick, camX, player, phantom, annotations,
   *   focus, hover, settings, flashlight, shake, roomVisuals }
   */
  render(f) {
    const { room, state, t, tick, camX } = f;
    const s = this.scale;
    const c = this.ctx;
    const boil = f.settings.get('lineBoil');
    const haze = state.haze;
    const amp = boil * (1 + haze * 0.9);

    // ---- 1. static layer (rebuilt on boil tick) ----
    // With line boil off the room is inked once and only redrawn when it changes.
    const inkTick = boil > 0 ? tick : 0;
    const key = `${room.id}|${inkTick}|${f.roomVersion}|${s}`;
    if (key !== this.staticKey) {
      this.staticKey = key;
      this.buildStatic(room, state, t, inkTick, amp, f);
    }

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;

    let shakeX = 0;
    let shakeY = 0;
    if (f.shake > 0) {
      const R = mulberry32(Math.floor(t * 60));
      shakeX = (R() - 0.5) * f.shake * 6;
      shakeY = (R() - 0.5) * f.shake * 6;
      // Shaking exposes the canvas edge; paint it first.
      c.fillStyle = '#100d0c';
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    const ox = -camX * s + shakeX * s;
    c.drawImage(this.staticLayer, Math.round(ox), Math.round(shakeY * s));

    // CO haze: a faint offset double image.
    if (haze > 0.25) {
      c.globalAlpha = (haze - 0.25) * 0.35;
      const off = (2 + haze * 5 + Math.sin(t * 0.7) * 2) * s;
      c.drawImage(this.staticLayer, Math.round(ox + off), Math.round(shakeY * s + off * 0.3));
      c.globalAlpha = 1;
    }

    // ---- 2. dynamic world ----
    const pen = this.pen;
    pen.tick = boil > 0 ? tick : 0;
    pen.amp = amp;
    c.setTransform(s, 0, 0, s, ox, shakeY * s);
    room.drawDynamic?.(pen, state, t, f);
    f.phantom.draw(pen, t);
    room.drawMid?.(pen, state, t, f); // scenery between the tall man and the player
    f.player.draw(pen, t);
    room.drawFront?.(pen, state, t, f);

    // ---- 3. darkness ----
    this.applyLighting(f, ox, shakeY * s);

    // ---- 4. post-light ----
    c.setTransform(s, 0, 0, s, ox, shakeY * s);
    // Red-pen marginalia sit on top of the page, so they stay readable in the dark.
    f.annotations.draw(pen, room.id, t);
    room.drawLit?.(pen, state, t, f);
    this.drawPrompt(f);

    if (f.flash > 0) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = `rgba(242,235,217,${f.flash})`;
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  buildStatic(room, state, t, tick, amp, f) {
    const s = this.scale;
    const L = this.staticLayer;
    const w = Math.round(room.width * s);
    const h = Math.round(VIEW_H * s);
    if (L.width !== w || L.height !== h) {
      L.width = w;
      L.height = h;
    }
    const c = L.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.drawImage(makePaper(room.width, VIEW_H, s, room.paperSeed || 7), 0, 0);
    c.setTransform(s, 0, 0, s, 0, 0);
    const pen = this.staticPen;
    pen.tick = tick;
    pen.amp = amp;
    if (!drawArt(c, `room.${room.id}`, 0, 0, room.width, VIEW_H)) {
      room.drawStatic(pen, state, t, f);
    }
  }

  /**
   * Build the shade layer — wash, hatching, vignette, minus the light — and multiply it
   * over the frame. Everything dark in one full-screen composite keeps this cheap.
   */
  applyLighting(f, ox, oy) {
    const { room, state, t } = f;
    const s = this.shadeScale;
    ox *= SHADE_RES;
    oy *= SHADE_RES;
    const W = this.shade.width;
    const H = this.shade.height;
    const sh = this.shade.getContext('2d');
    sh.setTransform(1, 0, 0, 1, 0, 0);
    sh.globalAlpha = 1;
    sh.globalCompositeOperation = 'copy';
    const darkness = room.darkness ?? 0.8;
    sh.fillStyle = `rgba(24,17,15,${darkness})`;
    sh.fillRect(0, 0, W, H);
    sh.globalCompositeOperation = 'source-over';
    // Hatching is as heavy as the room is dark: dense at night, faint at dawn.
    this.updateHatchPattern(f);
    sh.globalAlpha = Math.min(1, darkness * 1.1);
    sh.drawImage(this.hatchPattern, 0, 0);
    sh.globalAlpha = 1;

    sh.setTransform(s, 0, 0, s, ox, oy);
    sh.globalCompositeOperation = 'destination-out';
    const lights = room.lights ? room.lights(state, t, f) : [];
    for (const L of lights) {
      const g = sh.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
      g.addColorStop(0, `rgba(0,0,0,${L.a})`);
      g.addColorStop(L.core ?? 0.25, `rgba(0,0,0,${L.a * 0.8})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sh.fillStyle = g;
      sh.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    }

    // The player is always faintly readable.
    const p = f.player;
    const body = sh.createRadialGradient(p.x, p.footY - 45, 0, p.x, p.footY - 45, 80);
    body.addColorStop(0, 'rgba(0,0,0,0.35)');
    body.addColorStop(1, 'rgba(0,0,0,0)');
    sh.fillStyle = body;
    sh.fillRect(p.x - 80, p.footY - 125, 160, 160);

    // Torch cone: three nested wedges give a soft edge.
    if (f.flashlight.on) {
      const { hx, hy, ang } = p.hand;
      const len = 380;
      const flick = f.flashlight.power;
      const g = sh.createRadialGradient(hx, hy, 0, hx, hy, len);
      g.addColorStop(0, `rgba(0,0,0,${0.42 * flick})`);
      g.addColorStop(0.6, `rgba(0,0,0,${0.3 * flick})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sh.fillStyle = g;
      for (const spread of [0.2, 0.28, 0.36]) {
        sh.beginPath();
        sh.moveTo(hx, hy);
        sh.arc(hx, hy, len, ang - spread, ang + spread);
        sh.closePath();
        sh.fill();
      }
      const spill = sh.createRadialGradient(hx, hy, 0, hx, hy, 40);
      spill.addColorStop(0, `rgba(0,0,0,${0.4 * flick})`);
      spill.addColorStop(1, 'rgba(0,0,0,0)');
      sh.fillStyle = spill;
      sh.fillRect(hx - 40, hy - 40, 80, 80);
    }

    // The tall man is a gap in the ink: darkness itself thins where he stands.
    f.phantom.cutLight(sh);

    // Vignette (and the CO haze closing in) is part of the same layer.
    sh.setTransform(1, 0, 0, 1, 0, 0);
    sh.globalCompositeOperation = 'source-over';
    const haze = state.haze;
    const pulse = f.settings.get('reduceFlicker') ? 0 : Math.sin(t * 1.3) * 0.03 * haze;
    const inner = Math.max(W, H) * (0.42 - haze * 0.12 + pulse);
    const v = sh.createRadialGradient(W / 2, H / 2, inner, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(20,12,10,0)');
    v.addColorStop(1, `rgba(20,12,10,${0.55 + haze * 0.3})`);
    sh.fillStyle = v;
    sh.fillRect(0, 0, W, H);

    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'multiply';
    c.imageSmoothingEnabled = true;
    c.drawImage(this.shade, 0, 0, this.canvas.width, this.canvas.height);
    c.globalCompositeOperation = 'source-over';
  }

  /** Full-screen cross-hatch texture, redrawn on each boil tick. */
  updateHatchPattern(f) {
    const tick = f.settings.get('lineBoil') > 0 ? f.tick : 0;
    if (tick === this.hatchTick) return;
    this.hatchTick = tick;
    const s = this.shadeScale;
    const hp = this.hatchPattern.getContext('2d');
    hp.setTransform(1, 0, 0, 1, 0, 0);
    hp.clearRect(0, 0, this.hatchPattern.width, this.hatchPattern.height);
    hp.setTransform(s, 0, 0, s, 0, 0);
    const R = mulberry32(tick * 31 + 5);
    hp.strokeStyle = 'rgba(14,10,9,0.9)';
    hp.lineCap = 'round';
    const draw = (gap, dir, lw) => {
      hp.lineWidth = lw;
      hp.beginPath();
      for (let i = -VIEW_H; i < VIEW_W + VIEW_H; i += gap) {
        const j = (R() - 0.5) * 1.6;
        if (dir > 0) {
          hp.moveTo(i + j, VIEW_H + 2);
          hp.lineTo(i + VIEW_H + j + (R() - 0.5) * 3, -2);
        } else {
          hp.moveTo(i + j, -2);
          hp.lineTo(i + VIEW_H + j + (R() - 0.5) * 3, VIEW_H + 2);
        }
      }
      hp.stroke();
    };
    draw(3.4, 1, 0.7);
    draw(4.6, -1, 0.6);
  }

  drawPrompt(f) {
    const focus = f.focus;
    if (!focus || f.hidePrompt) return;
    const { hotspot, label, keyHint, appear } = focus;
    const pen = this.pen;
    const c = this.ctx;
    const a = clamp01(appear);
    pen.begin(`prompt-${hotspot.id}`);
    const cx = hotspot.x + hotspot.w / 2;
    const cy = hotspot.y + hotspot.h / 2;
    pen.ellipse(cx, cy, hotspot.w / 2 + 8, hotspot.h / 2 + 8, { col: RED, w: 1.5, frac: a, alpha: 0.9 });

    if (a < 0.5) return;
    const text = keyHint ? `${keyHint} · ${label}` : label;
    c.save();
    c.font = `20px ${FONT_HAND}`;
    const tw = c.measureText(text).width;
    c.restore();
    let lx = cx - tw / 2;
    lx = Math.max(f.camX + 8, Math.min(lx, f.camX + VIEW_W - tw - 8));
    let ly = hotspot.y - 16;
    if (ly < 26) ly = hotspot.y + hotspot.h + 28;
    c.save();
    c.translate(lx - 6, ly - 18);
    c.rotate(-0.015);
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(2, 3, tw + 12, 25);
    c.fillStyle = PAPER_LIGHT;
    c.fillRect(0, 0, tw + 12, 25);
    c.restore();
    pen.text(text, lx, ly, { size: 20, col: RED, font: FONT_HAND, rot: -0.015 });
  }
}

