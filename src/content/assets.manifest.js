// ASSET MANIFEST — the one place to plug in real art and audio.
//
// Every key below is drawn/synthesised procedurally while its value is `null`.
// To replace one, drop a file into /public/media/... and put its path here
// (relative, no leading slash), e.g.  'room.study': 'media/art/study.png'.
// Files are loaded lazily the first time they are needed; until a file has loaded
// (or if it fails to load) the procedural placeholder is used, so a missing file
// can never break the game. See README.md → "Replacing placeholder assets".

export const ART = {
  // Full-room backgrounds, drawn at room width × 360 logical px (e.g. 1520×720 @2x).
  // Hotspots stay defined in code, so keep furniture where the placeholder has it.
  'room.study': null,
  'room.landing': null,
  'room.nursery': null,
  'room.kitchen': null,
  'room.hall': null,
  'room.workshop': null,
  'room.greenhouse': null,
  'room.darkroom': null,
  'room.cellar': null,
  'room.backstair': null,
  'room.causeway': null,
  // Player sprite sheet support is intentionally not wired: the player is a
  // procedural rig. Replace drawPlayer() in src/world/player.js to use sprites.
};

export const AUDIO = {
  // Ambience loops (seamless .ogg/.mp3 recommended).
  'amb.attic': null,
  'amb.wind': null,
  'amb.rain': null,
  // Music layers.
  'music.base': null,
  'music.tension': null,
  // One-shot effects.
  'sfx.footstep': null,
  'sfx.door': null,
  'sfx.locked': null,
  'sfx.unlock': null,
  'sfx.pickup': null,
  'sfx.paper': null,
  'sfx.page': null,
  'sfx.pen': null,
  'sfx.click': null,
  'sfx.wrong': null,
  'sfx.solve': null,
  'sfx.sting': null,
  'sfx.chirp': null,
  'sfx.knock': null,
  'sfx.keydrop': null,
  'sfx.scrape': null,
  'sfx.musicbox': null,
  'sfx.window': null,
  'sfx.heartbeat': null,
  'sfx.chime': null,
  'sfx.alarm': null,
  'sfx.tape': null,
  'sfx.tick': null,
  'sfx.waves': null,
  'sfx.gas': null,
};
