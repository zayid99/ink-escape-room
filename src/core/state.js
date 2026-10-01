// The single serialisable game state. Everything that must survive a save lives here;
// anything derived (camera, animation timers, audio) lives in the systems that own it.

export const STATE_VERSION = 1;

export function createInitialState() {
  return {
    version: STATE_VERSION,
    chapter: 1,
    room: 'study',
    player: { x: 455, facing: 1 },
    inventory: [],
    flags: {},
    solved: {},
    clues: [],
    journal: [],
    /** Red-pen annotations drawn into rooms: { [roomId]: Annotation[] } */
    annotations: {},
    objective: '',
    /** Carbon-monoxide "haze", 0..1. Drives subtle visual distortion. */
    haze: 0.12,
    playTime: 0,
    savedAt: 0,
  };
}

/** Deep clone through JSON — the state is plain data by design. */
export const cloneState = (state) => JSON.parse(JSON.stringify(state));

/**
 * Validate and normalise a state object loaded from storage. Unknown or missing
 * fields fall back to defaults so an older save never crashes the game.
 */
export function normaliseState(raw, knownRooms) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.version !== STATE_VERSION) return null;
  const base = createInitialState();
  const s = { ...base, ...raw };
  s.player = { ...base.player, ...(raw.player || {}) };
  if (!Number.isFinite(s.player.x)) s.player.x = base.player.x;
  s.player.facing = s.player.facing < 0 ? -1 : 1;
  s.inventory = Array.isArray(raw.inventory) ? raw.inventory.filter((v) => typeof v === 'string') : [];
  s.clues = Array.isArray(raw.clues) ? raw.clues.filter((v) => typeof v === 'string') : [];
  s.journal = Array.isArray(raw.journal) ? raw.journal.filter((v) => typeof v === 'string') : [];
  s.flags = raw.flags && typeof raw.flags === 'object' ? raw.flags : {};
  s.solved = raw.solved && typeof raw.solved === 'object' ? raw.solved : {};
  s.annotations = raw.annotations && typeof raw.annotations === 'object' ? raw.annotations : {};
  s.haze = Number.isFinite(raw.haze) ? raw.haze : base.haze;
  s.playTime = Number.isFinite(raw.playTime) ? raw.playTime : 0;
  if (!knownRooms.includes(s.room)) return null;
  return s;
}
