// Time on the island. The house clocks run on "Lark time": forty minutes ahead of the
// true time. Everything here works in minutes after midnight.

export const LARK_OFFSET = 40;
/** True time when Chapter 2 begins (the kitchen clock then reads 4:52). */
export const NIGHT_TRUE_START = 4 * 60 + 12;
/** Low water on the morning of the 15th, as printed on the tide table (true time). */
export const LOW_WATER = 7 * 60 + 49;
/** The causeway is safe two hours either side of low water. */
export const SAFE_WINDOW = 120;

/**
 * What the house clocks say now. During the night they run in real time from the
 * moment Chapter 2 began; at dawn (Chapter 4) the time only moves when she waits.
 */
export function houseMinutes(state) {
  const f = state.flags;
  if (Number.isFinite(f.dawnClock)) return f.dawnClock;
  const base = Number.isFinite(f.clockBase) ? f.clockBase : state.playTime;
  return NIGHT_TRUE_START + LARK_OFFSET + Math.floor((state.playTime - base) / 60);
}

export const trueMinutes = (state) => houseMinutes(state) - LARK_OFFSET;

export function fmt(min) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/** 0 = causeway under water, 1 = fully walkable — by TRUE time. */
export function causewayExposure(trueMin) {
  const d = Math.abs(trueMin - LOW_WATER);
  if (d >= SAFE_WINDOW + 30) return 0;
  if (d <= SAFE_WINDOW) return 1;
  return 1 - (d - SAFE_WINDOW) / 30;
}

export const causewaySafe = (trueMin) => Math.abs(trueMin - LOW_WATER) <= SAFE_WINDOW;
