// The causeway at dawn. If she set out by the TRUE time, the stones are clear all the
// way across and Abel is waiting at the far end. If she trusted the house clocks, the
// sea comes up over the stones before she is halfway. (Game over: "High Water".)

import { INK, RED, PAPER_LIGHT, FONT_TYPE } from '../../render/ink.js';
import { clamp01 } from '../../core/math.js';
import { causewaySafe } from '../time.js';

const W = 1240;
const PATH_Y = 300;
const ABEL_X = 1170;

/** How far the water has come up over the path, 0..1 (only if she left too early). */
function flood(g) {
  if (causewaySafe(g.state.flags.crossTrue ?? 0)) return 0;
  return clamp01((g.player.x - 260) / 320);
}

export const causeway = {
  id: 'causeway',
  title: 'The causeway',
  width: W,
  walkY: PATH_Y,
  bounds: { min: 60, max: ABEL_X - 50 },
  spawnX: 80,
  darkness: 0.35,
  paperSeed: 109,
  ambience: 'attic',
  wind: () => 1,
  hazeTarget: () => 0,
  /** Never autosave out here: a doomed crossing must not become the save. */
  noSave: true,

  lights() {
    return [{ x: 1000, y: 120, r: 520, a: 0.55 }];
  },

  drawStatic(pen) {
    pen.begin('cw-sky');
    pen.hatch(0, 0, W, 150, { gap: 7, w: 0.35, alpha: 0.35 });
    pen.circle(1000, 110, 22, { w: 1.1 });
    // Horizon and the mainland ahead.
    pen.line(0, 196, W, 192, { w: 1.1 });
    pen.poly([[880, 192], [960, 170], [1060, 176], [1160, 160], [1240, 168]], { w: 1.2 });
    for (let i = 0; i < 6; i++) pen.rect(1080 + i * 22, 150 - (i % 3) * 6, 14, 16 + (i % 3) * 6, { w: 0.8 });
    pen.text('the harbour', 1090, 140, { size: 9, font: FONT_TYPE, alpha: 0.7 });
    // Wexley House behind her, on the island.
    pen.begin('cw-house');
    pen.rect(0, 100, 120, 96, { w: 1.4 });
    pen.poly([[-10, 100], [60, 60], [130, 100]], { w: 1.4 });
    pen.rect(86, 118, 20, 18, { w: 1 });
    pen.text('nursery', 82, 114, { size: 7, font: FONT_TYPE, alpha: 0.6 });
    // The causeway stones.
    pen.begin('cw-stones');
    pen.line(0, 266, W, 266, { w: 1.2 });
    pen.line(0, 340, W, 340, { w: 1.2 });
    for (let x = 0; x < W; x += 34) {
      pen.rect(x + 2, 270, 30, 16, { w: 0.6, alpha: 0.7, passes: 1 });
      pen.rect(x + 18, 290, 30, 16, { w: 0.6, alpha: 0.7, passes: 1 });
      pen.rect(x + 2, 310, 30, 16, { w: 0.6, alpha: 0.7, passes: 1 });
    }
    // Weed and wet sand either side.
    for (let i = 0; i < 40; i++) pen.line(i * 31, 262, i * 31 + 6, 254, { w: 0.6, alpha: 0.6, passes: 1 });
  },

  drawDynamic(pen, st, t, f) {
    const g = f.game;
    // The sea on either side: swell lines that move.
    const c = pen.ctx;
    c.strokeStyle = 'rgba(31,27,26,0.55)';
    c.lineWidth = 0.8;
    c.beginPath();
    for (let row = 0; row < 4; row++) {
      const y = 204 + row * 14;
      for (let x = 0; x < W; x += 40) {
        const o = Math.sin(t * 0.9 + x * 0.02 + row) * 3;
        c.moveTo(x, y + o);
        c.quadraticCurveTo(x + 10, y + o - 3, x + 20, y + o);
      }
    }
    c.stroke();
    // Flood over the path if she came out too early.
    const fl = flood(g);
    if (fl > 0) {
      pen.begin('cw-flood');
      const left = 260;
      const right = W;
      const top = 340 - 80 * fl;
      pen.fillRect(left, top, right - left, 360 - top, 'rgba(70,80,90,0.35)');
      c.strokeStyle = 'rgba(31,27,26,0.7)';
      c.beginPath();
      for (let x = left; x < right; x += 26) {
        const o = Math.sin(t * 2 + x * 0.05) * 3;
        c.moveTo(x, top + o);
        c.quadraticCurveTo(x + 7, top + o - 4, x + 13, top + o);
      }
      c.stroke();
    }
    // Abel, at the far end, waiting with his lantern — only when it is safe to come.
    if (causewaySafe(st.flags.crossTrue ?? 0)) {
      pen.begin('cw-abel');
      const x = ABEL_X;
      const F = PATH_Y;
      c.fillStyle = INK;
      c.beginPath();
      c.moveTo(x - 9, F - 70);
      c.lineTo(x + 9, F - 70);
      c.lineTo(x + 14, F - 20);
      c.lineTo(x - 14, F - 20);
      c.closePath();
      c.fill();
      pen.line(x - 5, F - 20, x - 6, F, { w: 2.6 });
      pen.line(x + 5, F - 20, x + 6, F, { w: 2.6 });
      pen.fillEllipse(x, F - 82, 9, 10, PAPER_LIGHT);
      pen.circle(x, F - 82, 9.5, { w: 1.1 });
      pen.hatch(x - 10, F - 94, 20, 8, { gap: 2, w: 0.6 });
      pen.line(x - 9, F - 60, x - 22, F - 44, { w: 2.2 });
      pen.line(x - 22, F - 44, x - 22, F - 36, { w: 0.8 });
      pen.rect(x - 27, F - 36, 10, 12, { w: 1 });
    }
  },

  drawLit(pen, st) {
    if (causewaySafe(st.flags.crossTrue ?? 0)) {
      pen.begin('cw-lantern');
      pen.fillEllipse(ABEL_X - 22, PATH_Y - 30, 3, 3, RED);
      pen.ellipse(ABEL_X - 22, PATH_Y - 30, 9, 9, { col: RED, w: 0.8, alpha: 0.6 });
    }
  },

  hotspots: [
    {
      id: 'house',
      label: 'Wexley House',
      x: 0,
      y: 56,
      w: 130,
      h: 140,
      approachX: 80,
      async onInteract(g) {
        await g.say('The house, behind me. From out here it’s small. Just a house.');
      },
    },
  ],

  onUpdate(g) {
    if (g.busy || g.ui.blocking() || g.roomTimers.causewayDone) return;
    const safe = causewaySafe(g.state.flags.crossTrue ?? 0);
    if (!safe && g.player.x > 520) {
      g.roomTimers.causewayDone = true;
      g.ambient(() => g.chapterHook('drown'));
    } else if (safe && g.player.x > ABEL_X - 70) {
      g.roomTimers.causewayDone = true;
      g.ambient(() => g.chapterHook('reachAbel'));
    }
  },

  async onEnter(g) {
    const safe = causewaySafe(g.state.flags.crossTrue ?? 0);
    g.sfx('waves');
    if (safe) await g.say('Grey light. The stones are wet, but they’re clear — all the way across.', 'There’s someone at the far end. A lantern.');
    else await g.say('The stones are awash. Only ankle-deep.', 'The clocks said there was time.');
  },
};
