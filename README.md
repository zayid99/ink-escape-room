# Marginalia

*A 2D psychological-horror escape-room game, drawn in ink on the pages of a journal.*

> Don’t trust the clocks. Don’t trust me either. — ~~W~~ M

You wake at a desk in the attic of Wexley House, on a tidal island cut off by the sea, at 3:17 a.m. Your sister Wren came here to empty your dead father’s house and stopped answering her phone. The door is locked from the outside. Someone has been writing in your journal in red pen.

The whole world is that journal: shaky ink lines that never sit still, cross-hatching for shadow, ink-wash darkness with light cut out by a candle or your torch, and **red pen only** for fire, annotations and the clues that matter. Drawings get crossed out, annotated and redrawn when the story changes.

- **Story bible (spoilers!):** [`STORY.md`](STORY.md) — premise, characters, all four chapters, the twists, the final revelation and the full clue map.
- **Design brief:** [`GAME_SPEC.md`](GAME_SPEC.md) · **Art direction reference:** [`style-reference.html`](style-reference.html) (option E, “Ink Sketchbook”).

## Status

**The whole game is playable start to finish** — four chapters, 11 rooms, 12 main puzzles, two endings and a game over. Allow roughly 1–2 hours.

| Chapter | Rooms | Puzzles | Ends on |
|---|---|---|---|
| 1 — *The Margin* | attic study, landing, nursery | the locked door · Father’s padlock (“the true minute”) · the nursery from memory | Twist 1 |
| 2 — *Lark Time* | kitchen, hall, workshop | the snapped answerphone tape · the regulator (set it to *true* time — the clocks keep running) · the mirror and the window | Twist 2 |
| 3 — *Exposure* | glasshouse, darkroom, cellar | Abel’s CO alarm (then follow its readings) · developing the film in the dark · shutting the boiler down | Twist 3 |
| 4 — *Low Water* | back stair, nursery, hall, causeway | the night of the fire, by true time · the last page · crossing at low water | The ending |

Endings: **Wren** (the true ending), **Night Five** (a loop ending — you can turn back the page), and the **High Water** game over.

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
  systems/                inventory, puzzles (code locks, ordering, multi-step), story (flags/clues/journal/objectives), audio
  ui/                     menus, pause, settings, dialogue, document viewer, code lock, ordering puzzle, choices,
                          inventory, journal, HUD (objective, held item, CO meter), story cards
  content/
    index.js              registry of rooms, items, clues, journal pages, documents, puzzles, chapters
    items.js · clues.js · journal.js · documents.js · sketches.js · assets.manifest.js
    draw.js · time.js     shared ink drawing helpers · house clocks, Lark time and the tide
    chapter1/             study.js, landing.js, nursery.js, chapter script
    chapter2/             kitchen.js, hall.js, workshop.js, data.js (items/clues/docs/journal), chapter script
    chapter3/             greenhouse.js, darkroom.js, cellar.js, data.js, chapter script
    chapter4/             backstair.js, causeway.js, data.js, chapter script (finale, endings)
```

### How the hand-drawn look works

The `Pen` (`src/render/ink.js`) draws every line with a little jitter from a seeded PRNG. The seed is a **boil tick** that advances ten times a second, mixed with a per-object salt. Within a tick a drawing is perfectly stable; on the next tick it redraws slightly differently. Movement (player, torch, camera, sliding furniture) is interpolated every frame at 60 fps, so motion stays smooth while the linework “boils”. The static room is re-inked only on each boil tick (cached in between), and the darkness — wash, cross-hatching and vignette with light cut out — is one half-resolution layer multiplied over the frame.

### Adding a room or chapter

1. Create a room module like `src/content/chapter1/study.js`: `width`, `bounds`, `lights()`, `drawStatic()`, optional `drawDynamic()`/`drawLit()`, `hotspots[]` with `onInteract(g)` / `onUse(g, itemId)`, `onEnter(g, from)`.
2. Register rooms, puzzles and the chapter script (`begin`, `resume`, `end`, optional `hooks` and `onRoomEnter`) in `src/content/index.js`. `g.startChapter(n)` begins a chapter and stores the checkpoint that **Restart chapter** returns to.
3. Add any new items, clues, documents or journal pages to their registries.

## Save system

Progress autosaves to localStorage shortly after anything changes (except on the causeway, so a doomed crossing never becomes your save) (never in the middle of a scripted moment), on every room change, and when the tab is hidden or closed. **Pause → Save game** saves on demand; **Continue** on the main menu and **Pause → Load last save** restore it. Saved: chapter, room and position, inventory, puzzle state, story flags, clues, journal pages, red-pen annotations, haze and play time. Saves are versioned and validated; a corrupt or incompatible save is ignored rather than crashing. If storage is unavailable (private mode, blocked site data) the game still runs, it just can’t remember.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). Needs Canvas 2D and ES modules; Web Audio is optional (the game is silent without it).

## Testing

The whole game was play-tested end to end in headless Chromium (Playwright), all four chapters in one run: every puzzle including wrong answers (wrong padlock code, the regulator set to house time, chemicals and boiler steps in the wrong order, the fire timeline in Lark time), item use and combination, both tall-man sightings, all three twists, **Restart chapter** mid-game (items from earlier chapters survive), the loop ending and “Turn back the page”, the **High Water** game over and **Load last save**, and the true ending — with no console errors. Chapter 1 also has keyboard/mouse-only and phone-viewport runs, and a save → reload → Continue round trip.

## Stuck? (spoilers)

<details>
<summary>Chapter 1</summary>

Take the journal from the desk. Tide table (wall by the window) under the door first, then the hairpin (suitcase) through the keyhole. On the landing, Father’s ledger says the clocks run 40 minutes fast: the longcase shows 3:17, so the padlock is **0237**. In the nursery, compare the room with your drawing: the bed labels, the curtains, and — after looking at the dollhouse — the wardrobe. Then push it.
</details>

<details>
<summary>Chapter 2</summary>

Take the snapped cassette from the answerphone, sticky tape from the dresser drawer, **Combine** them, hold the mended tape and use it on the answerphone. Then search the bread crock for Father’s keys. The regulator’s pendulum is propping the hall cupboard door. Hang it, then set the regulator to the kitchen clock’s time **minus 40 minutes**. After reading Mother’s diary, stand at the hall window with your back to the mirror; when he appears in the glass, look out of the window.
</details>

<details>
<summary>Chapter 3</summary>

Mother’s keys open the glasshouse (kitchen) and the darkroom (hall). Use the battery from the attic desk drawer on the alarm in the glasshouse. In the darkroom: pull the safelight, turn the torch off (**F**), then pour brown bottle → vinegar → hypo crystals → water. The paper safe (torch off) holds the cellar key. In the cellar, open the coal chute for air, find the cracked flue joint with the alarm, read the brass tag, then shut down: gas → check pilot → pump → air.
</details>

<details>
<summary>Chapter 4</summary>

Kitchen → back stair. True times: flue 2:20 → cellar-door clock (3:02 → 2:22) → Abel runs (2:25) → half-landing (3:09 → 2:29) → curtain (3:17 → 2:37). In the nursery, sign the page. Out via the back stair, kitchen and hall; the front-door code is Wren’s birthday, **1403**. Low water is 7:49 true time, safe from 5:49 — the house clocks will say **6:29**. Wait until then (or watch the causeway rise out of the sea through the window).
</details>
