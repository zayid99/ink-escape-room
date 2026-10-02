# Marginalia

*A 2D psychological-horror escape-room game, drawn in ink on the pages of a journal.*

> Don’t trust the clocks. Don’t trust me either. — ~~W~~ M

You wake at a desk in the attic of Wexley House, on a tidal island cut off by the sea, at 3:17 a.m. Your sister Wren came here to empty your dead father’s house and stopped answering her phone. The door is locked from the outside. Someone has been writing in your journal in red pen.

The whole world is that journal: shaky ink lines that never sit still, cross-hatching for shadow, ink-wash darkness with light cut out by a candle or your torch, and **red pen only** for fire, annotations and the clues that matter. Drawings get crossed out, annotated and redrawn when the story changes.

- **Story bible (spoilers!):** [`STORY.md`](STORY.md) — premise, characters, all four chapters, the twists, the final revelation and the full clue map.
- **Design brief:** [`GAME_SPEC.md`](GAME_SPEC.md) · **Art direction reference:** [`style-reference.html`](style-reference.html) (option E, “Ink Sketchbook”).

## Status

| Chapter | State |
|---|---|
| 1 — *The Margin* (attic study, landing, nursery · 3 puzzles · Twist 1) | **Playable start to finish** |
| 2 — *Lark Time* · 3 — *Exposure* · 4 — *Low Water* | Written in `STORY.md`; not built yet |

The engine already supports what later chapters need: multiple rooms, code locks, multi-step puzzles, item use and combination, documents, journal pages, red-pen world annotations, the tall man, game-over and ending screens, and save/load.

## Tech stack

- **Vite** (dev server and production build) + **vanilla JavaScript ES modules** — no framework.
- **Canvas 2D** for the world. Every image is drawn procedurally at runtime; there are no image assets.
- **Web Audio API** for sound. Every sound is synthesised as a placeholder; real files can be dropped in (see below).
- **DOM overlay** for UI (menus, documents, journal, inventory, code lock), styled as paper.
- **localStorage** for saves and settings.
- Fonts are bundled from `@fontsource` (Special Elite, Caveat, IM Fell English) — no CDN calls at runtime.

## Getting started

Requires **Node.js 20.19+** (Node 22 recommended).

```bash
npm install
npm run dev       # http://localhost:5173 with hot reload
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot module reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally (http://localhost:4173) |

## Controls

| Input | Action |
|---|---|
| A / D or ← / → | Walk |
| Mouse | Aim the torch · click to walk to / use something |
| E · Space · Enter | Interact · advance text |
| I or Tab | Pockets (inventory) |
| J | Journal & clues |
| Q · right-click | Put away the held item |
| F | Torch on / off |
| Esc or P | Pause |

Touch: tap to walk or interact; the Journal / Pockets / Pause buttons sit in the top-right corner. Phones play best held sideways.

**Using items:** open Pockets, select an item, press **Hold**, then interact with something in the room. **Combine** two items from the same panel.

## Deploying to Netlify

The repo includes [`netlify.toml`](netlify.toml):

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**, pick the repo. The build command and publish directory are read from `netlify.toml`, so no settings are needed.
3. Deploy.

Or with the CLI: `npm run build && npx netlify deploy --prod --dir=dist`.

Notes:

- The build uses a relative base (`base: './'` in `vite.config.js`), so it also works from a sub-folder or any static host.
- There is no client-side routing; the redirect rule in `netlify.toml` simply serves the game for any path.
- **No environment variables are needed.**
- Hashed assets under `/assets/*` are served with long-lived cache headers.

## Replacing placeholder assets

Everything is procedural, so the game is complete with zero asset files. To use real art or audio, edit **`src/content/assets.manifest.js`** — the single place that maps asset keys to files:

```js
export const ART = {
  'room.study': 'media/art/study.png', // was null
};
export const AUDIO = {
  'sfx.door': 'media/audio/door.ogg',  // was null
  'amb.rain': 'media/audio/rain.ogg',
};
```

- Put files in **`public/media/art/`** or **`public/media/audio/`**. Paths are relative (no leading slash) so they work from any base path.
- **Room art** replaces the whole static room drawing. Draw at room width × 360 logical px (e.g. 1520 × 720 for the 760-wide study at 2×). Hotspots stay defined in code, so keep furniture where the placeholder draws it (see each room file in `src/content/chapter1/`). Moving objects, light, the player and red annotations are still drawn on top.
- **Audio**: loops (`amb.*`, `music.*`) should be seamless; one-shots (`sfx.*`) are played as-is. Files load lazily after the first click/keypress.
- A missing or broken file logs one warning and falls back to the placeholder, so it can never break the game.

## Configuration

Players change these in **Settings** (saved in localStorage): master / music / ambience / effects volume, line boil (still → full), text speed, reduce flicker & shake, full screen, and delete saved game. `prefers-reduced-motion` is respected on first launch.

Developer-facing knobs:

| Where | What |
|---|---|
| `src/core/settings.js` | Default settings |
| `src/render/renderer.js` | Logical resolution (640 × 360), max backing width, shade-layer resolution |
| Each room file | `darkness`, `lights()`, `hazeTarget()` (carbon-monoxide haze), `wind()` |
| `src/content/assets.manifest.js` | Real art/audio files |

The renderer lowers its resolution automatically if frames consistently run long, so weak devices stay playable.

## Project structure

```
src/
  main.js                 boot: fonts, then the Game
  game.js                 loop, system wiring, scripting API for content (g.say, g.read, g.give, g.goTo…)
  core/                   math & PRNG, event bus, input, state, save (localStorage), settings, asset loader
  render/
    ink.js                the Pen: boiling ink lines, hatching, circles, text, cross-outs
    paper.js              procedural aged paper
    renderer.js           static layer per boil tick, ink-wash lighting, prompts
  world/                  player rig, interaction/hotspots, red-pen annotations, the tall man
  systems/                inventory, puzzles (code locks, multi-step), story (flags/clues/journal/objectives), audio
  ui/                     menus, pause, settings, dialogue, document viewer, code lock, inventory, journal, HUD, story cards
  content/
    index.js              registry of rooms, items, clues, journal pages, documents, puzzles, chapters
    items.js · clues.js · journal.js · documents.js · sketches.js · assets.manifest.js
    chapter1/             study.js, landing.js, nursery.js, shared drawing helpers, chapter script
```

### How the hand-drawn look works

The `Pen` (`src/render/ink.js`) draws every line with a little jitter from a seeded PRNG. The seed is a **boil tick** that advances ten times a second, mixed with a per-object salt. Within a tick a drawing is perfectly stable; on the next tick it redraws slightly differently. Movement (player, torch, camera, sliding furniture) is interpolated every frame at 60 fps, so motion stays smooth while the linework “boils”. The static room is re-inked only on each boil tick (cached in between), and the darkness — wash, cross-hatching and vignette with light cut out — is one half-resolution layer multiplied over the frame.

### Adding a room or chapter

1. Create a room module like `src/content/chapter1/study.js`: `width`, `bounds`, `lights()`, `drawStatic()`, optional `drawDynamic()`/`drawLit()`, `hotspots[]` with `onInteract(g)` / `onUse(g, itemId)`, `onEnter(g, from)`.
2. Register rooms, puzzles and the chapter script (`begin`, `resume`, `end`) in `src/content/index.js`.
3. Add any new items, clues, documents or journal pages to their registries.

## Save system

Progress autosaves to localStorage shortly after anything changes (never in the middle of a scripted moment), on every room change, and when the tab is hidden or closed. **Pause → Save game** saves on demand; **Continue** on the main menu and **Pause → Load last save** restore it. Saved: chapter, room and position, inventory, puzzle state, story flags, clues, journal pages, red-pen annotations, haze and play time. Saves are versioned and validated; a corrupt or incompatible save is ignored rather than crashing. If storage is unavailable (private mode, blocked site data) the game still runs, it just can’t remember.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). Needs Canvas 2D and ES modules; Web Audio is optional (the game is silent without it).

## Testing

Chapter 1 was play-tested end to end in headless Chromium (Playwright): every hotspot, all three puzzles including wrong answers, item use/combination, the tall-man sighting, the twist, the chapter-end screen, journal/inventory/pause/settings, a save → reload → Continue round trip, and phone-sized viewports — with no console errors.
