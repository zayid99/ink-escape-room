// Placeholder-aware asset loading. Content asks for a key; if the manifest maps it to a
// file, that file is loaded lazily and used once ready. Otherwise the caller's
// procedural fallback is used. Failures are logged once and fall back silently.

import { ART } from '../content/assets.manifest.js';

const images = new Map(); // key -> { img, ready, failed }

function resolveUrl(path) {
  // Relative to the page so the build works under any base path.
  return new URL(path, document.baseURI).href;
}

function requestImage(key) {
  const path = ART[key];
  if (!path) return null;
  let entry = images.get(key);
  if (!entry) {
    const img = new Image();
    entry = { img, ready: false, failed: false };
    img.onload = () => {
      entry.ready = true;
    };
    img.onerror = () => {
      entry.failed = true;
      console.warn(`[assets] could not load art "${key}" from ${path}; using placeholder`);
    };
    img.src = resolveUrl(path);
    images.set(key, entry);
  }
  return entry;
}

/**
 * Draw the art registered under `key` into the rect, or return false so the
 * caller can draw its procedural placeholder.
 */
export function drawArt(ctx, key, x, y, w, h) {
  const entry = requestImage(key);
  if (!entry || !entry.ready || entry.failed) return false;
  ctx.drawImage(entry.img, x, y, w, h);
  return true;
}

export { resolveUrl };
