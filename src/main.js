// Entry point: wait (briefly) for the hand-lettering fonts, then open the journal.

// Fonts are bundled (no CDN at runtime): typewriter, handwriting, and the title face.
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/caveat/latin-400.css';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/im-fell-english/latin-400.css';
import './styles/main.css';
import { Game } from './game.js';

async function loadFonts() {
  if (!document.fonts?.load) return;
  const fonts = ['20px "Caveat"', '16px "Special Elite"', '40px "IM Fell English"'];
  // Never hold the game hostage to font loading: give up after 2.5 s and use fallbacks.
  await Promise.race([Promise.allSettled(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2500))]);
}

async function boot() {
  const canvas = document.getElementById('game');
  const stage = document.getElementById('stage');
  const uiRoot = document.getElementById('ui');
  const bootEl = document.getElementById('boot');
  if (!canvas.getContext) {
    bootEl.textContent = 'Sorry — this browser can’t draw the game (no Canvas support).';
    return;
  }
  await loadFonts();
  const game = new Game({ canvas, stage, uiRoot });
  // Exposed for debugging and automated play-testing.
  window.__marginalia = game;
  game.start();
  bootEl.remove();
}

boot().catch((err) => {
  console.error('[boot] failed to start', err);
  const bootEl = document.getElementById('boot');
  if (bootEl) bootEl.textContent = 'Something went wrong opening the journal. Please reload the page.';
});
