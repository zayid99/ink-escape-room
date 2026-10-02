# Marginalia — portal build (itch.io, CrazyGames)

A clean, self-contained build for HTML5 game portals. It is built from the same `src/` as the web version. Every portal-only difference lives in [`vite.config.js`](vite.config.js), so the normal build (`npm run build`, Netlify) is unchanged.

```bash
npm install
node portal/build.mjs
```

The build writes two outputs:

- `portal/build/marginalia/`: the folder to upload, with `index.html` at the top.
- `portal/marginalia-portal.zip`: the same folder zipped, ready to upload.

The script fails the build if any of these is true:

- `index.html` is not at the top level.
- The build has 1,000 or more files.
- The build is 50 MB or larger.
- Any HTML, JS or CSS file references an external URL or a root-absolute path.

## What's in it

| File | Size | Notes |
|---|---|---|
| `index.html` | 2 KB | Page shell, plus a small inline script that keeps keys from scrolling the portal page. |
| `game.js` | 524 KB, about 290 KB gzipped | The whole game, its CSS and the three fonts, in one classic script. |

There are 2 files and no network requests besides those two. It runs from any folder or sub-path, inside an iframe, or by opening `index.html` straight from disk.

## Removed or changed compared with the web build

**Removed**

- **Open Graph / Twitter link-preview tags.** They pointed at absolute `https://scaperoomink.netlify.app` URLs. Portals provide their own page metadata.
- **`share.jpg` and the rest of `public/`.** The share image and the empty `media/` placeholder folders are not shipped.
- **The `woff` font fallbacks.** Only `woff2` is shipped; every supported browser reads it.
- **The global debug handle (`window.__marginalia`).** It now exists only when the URL contains `?debug`, which is used for automated testing.
- **`type="module"` and `crossorigin` on the script and stylesheet tags.** The game is bundled as one classic `defer` script, because module scripts and cross-origin font loads are blocked when a page is opened from `file://`.

**Changed**

- **Fonts are inlined** into `game.js` as data URLs, so nothing is fetched separately.
- **Fullscreen button.** It is hidden in Settings when the iframe isn't allowed to go fullscreen (`document.fullscreenEnabled === false`), instead of doing nothing. Portals add their own fullscreen button.
- **Menu focus.** Menu buttons use `data-autofocus` instead of the HTML `autofocus` attribute. Inside a cross-origin iframe (how portals embed games), Chrome blocks `autofocus` and logs a console error each time a menu opens. Focus is still moved to the same button by script, so keyboard play is unchanged.
- **Keys no longer scroll the portal page.** Arrow keys, Space, Page Up/Down, Home and End would otherwise scroll the page around the iframe. Sliders and dropdowns keep their keys, buttons keep Space, and scrollable panels such as the journal still scroll.
- **Touch mode from the start.** On touchscreens (`pointer: coarse`) the game starts in touch mode, so prompts say "Tap", and the opening controls hint reads "Tap to walk · tap things to use them · Journal, Pockets and pause are top right" instead of listing keyboard keys. The web build only switches after the first tap on the game scene.
- **No pull-to-refresh, overscroll bounce or double-tap zoom on touch.** The page also blocks long-press text selection and callouts, except in form fields.

**Already true of the game, kept as is**

- No ads, analytics, accounts, logins, payments or outbound links.
- Progress and settings save to `localStorage` only. If storage is blocked, for example in a private window or a sandboxed iframe, the game still runs; it just can't remember.
- The game view is always 16:9 and letterboxes inside any frame size.
- It plays with mouse and keyboard or with touch alone: tap to walk and interact, and on-screen Journal, Pockets and Pause buttons.

## Uploading

### itch.io

1. Go to **Create new project**.
2. Set **Kind of project** to **HTML**.
3. Upload `marginalia-portal.zip` and tick **This file will be played in the browser**.
4. Under **Embed options**, set the viewport to **960 × 540** (or 1280 × 720).
5. Turn on **Mobile friendly** (landscape) and **Fullscreen button**.

### CrazyGames

1. Go to the Developer Portal and choose **Submit game**.
2. Choose **HTML5** and upload `marginalia-portal.zip`.
3. Set the orientation to **landscape** and the aspect ratio to **16:9**.

The game does not use the CrazyGames SDK, which only matters for ads or their account features.

## Tested

The zip was unpacked and tested in headless Chromium, with no console errors or warnings in any run.

- **Opened straight from disk** (`file://`): the whole game, all four chapters. That covers every puzzle, both endings, the High Water game over, Restart chapter, and Load last save.
- **In a cross-origin 960 × 540 iframe, like a portal**, with mouse and keyboard:
  - the menu loads, and the intro advances by clicking;
  - you can walk with the keyboard, and click to walk;
  - the keys don't scroll the host page;
  - Pause → Save game writes to `localStorage`, and a reload followed by Continue restores it;
  - the fullscreen button is hidden when the frame doesn't allow fullscreen;
  - an 800 × 600 frame is letterboxed to 800 × 450;
  - there are no network requests besides `index.html` and `game.js`.
- **On a phone in landscape (844 × 390), with touch only:** the stage is 16:9, taps advance the dialogue, tap-to-walk works, and the Pause, Save and Journal buttons work.
