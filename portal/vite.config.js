// Portal build (itch.io, CrazyGames and similar): a self-contained folder that runs from any
// path, inside an iframe, or straight from disk. It builds the same src/ as the web version;
// every portal-only difference lives in this file, so the main build is never affected.
//
//   node portal/build.mjs     → portal/build/marginalia/ and portal/marginalia-portal.zip
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** Exact source edits applied at build time. Each one must match, or the build fails. */
const PATCHES = [
  {
    // Only woff2 is shipped (every supported browser reads it); drop the .woff fallback.
    file: /@fontsource\/.*\.css$/,
    find: /,\s*url\([^)]*\.woff\) format\('woff'\)/,
    replace: '',
  },
  {
    // No global debug handle in the portal build unless ?debug is in the URL.
    file: /src\/main\.js$/,
    find: 'window.__marginalia = game;',
    replace: "if (/[?&]debug\\b/.test(location.search)) window.__marginalia = game;",
  },
  {
    // Portals often embed the game in an iframe without fullscreen permission: hide the
    // button rather than offer one that does nothing (portals have their own fullscreen).
    file: /src\/ui\/menus\.js$/,
    find: 'fsBtn.hidden = !document.documentElement.requestFullscreen;',
    replace: 'fsBtn.hidden = !document.documentElement.requestFullscreen || document.fullscreenEnabled === false;',
  },
  {
    // Inside a cross-origin iframe (how every portal embeds games) Chrome blocks the HTML
    // autofocus attribute and logs a console error each time a menu opens. Focus is already
    // moved in script when a panel opens (modal.js), so mark the button with a data attribute
    // instead of the native one; keyboard focus behaves exactly as before.
    file: /src\/ui\/dom\.js$/,
    find: "else if (v === true) node.setAttribute(k, '');",
    replace: "else if (v === true) node.setAttribute(k === 'autofocus' ? 'data-autofocus' : k, '');",
  },
  {
    file: /src\/ui\/modal\.js$/,
    find: "querySelector('[autofocus], ",
    replace: "querySelector('[data-autofocus], ",
  },
  {
    // Start in touch mode on touchscreens, so the first hints say "Tap" rather than "E" or
    // "Click". (The web build only switches after the first tap on the game scene.)
    file: /src\/game\.js$/,
    find: 'this.touchMode = false;',
    replace: "this.touchMode = !!window.matchMedia?.('(pointer: coarse)').matches;",
  },
  {
    // The opening controls hint, in a touch version for phones and tablets.
    file: /src\/content\/chapter1\/index\.js$/,
    find: "g.hud.hint('A / D or ← → to walk · E to interact · mouse aims the torch · I pockets · J journal · Esc pause', 9000);",
    replace: "g.hud.hint(g.touchMode ? 'Tap to walk · tap things to use them · Journal, Pockets and pause are top right' : 'A / D or ← → to walk · E to interact · mouse aims the torch · I pockets · J journal · Esc pause', 9000);",
  },
];

// Stops arrow keys, Space and Page keys from scrolling the portal page around the iframe.
// Form controls keep their keys, buttons keep Space/Enter, and a scrollable panel inside
// the game (the journal, long documents) may still scroll itself.
const SCROLL_GUARD = `<script>
(function () {
  var KEYS = { ArrowUp: -1, PageUp: -1, Home: -1, ArrowDown: 1, PageDown: 1, End: 1, Space: 1, ArrowLeft: 0, ArrowRight: 0 };
  function panelCanScroll(el, dir) {
    for (; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
      var oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        if (dir < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      }
    }
    return false;
  }
  addEventListener('keydown', function (e) {
    if (!(e.code in KEYS)) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    if (tag === 'BUTTON' && e.code === 'Space') return;
    var dir = e.code === 'Space' && e.shiftKey ? -1 : KEYS[e.code];
    if (dir !== 0 && panelCanScroll(t, dir)) return;
    e.preventDefault();
  }, { capture: true });
})();
</script>
<style>html, body { overscroll-behavior: none; touch-action: manipulation; } body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; } input, select, textarea { -webkit-user-select: text; user-select: text; }</style>`;

function portalClean() {
  return {
    name: 'portal-clean',
    enforce: 'pre',
    transform(code, id) {
      const path = id.replace(/\\/g, '/').split('?')[0];
      let out = code;
      for (const p of PATCHES) {
        if (!p.file.test(path)) continue;
        const next = out.replace(p.find, p.replace);
        if (next === out) this.error(`portal patch did not apply to ${path}: ${p.find}`);
        out = next;
        p.applied = true;
      }
      return out === code ? null : { code: out, map: null };
    },
    buildEnd() {
      for (const p of PATCHES) if (!p.applied) this.error(`portal patch never applied: ${p.find}`);
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const out = html
          // Link-preview tags carry absolute URLs to the Netlify site; portals supply their own.
          .replace(/\s*<meta (property="og:|name="twitter:)[^>]*>/g, '')
          // A classic deferred script runs from file:// as well as http(s); modules do not.
          .replace(/<script type="module" crossorigin src=/g, '<script defer src=')
          .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=')
          .replace('</head>', `${SCROLL_GUARD}\n</head>`);
        if (/og:|twitter:|type="module"|crossorigin|https?:\/\/(?!www\.w3\.org)/.test(out)) {
          throw new Error('portal index.html still has module scripts, crossorigin or external URLs');
        }
        return out;
      },
    },
  };
}

export default defineConfig({
  root,
  base: './',
  publicDir: false, // public/ only holds the Netlify share image and empty media folders
  plugins: [portalClean()],
  build: {
    target: 'es2020',
    outDir: fileURLToPath(new URL('./build/marginalia', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    modulePreload: false,
    chunkSizeWarningLimit: 800, // one file on purpose: ~300 kB gzipped, fonts included
    // Fonts are inlined so the build is three files and nothing is fetched cross-origin.
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? true : undefined),
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'game.js',
        assetFileNames: 'game[extname]',
      },
    },
  },
});
