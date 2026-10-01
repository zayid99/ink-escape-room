// localStorage persistence for game progress and settings. Every access is guarded:
// storage can be unavailable (private mode, blocked site data) and the game must
// still run — it just won't remember.

import { normaliseState } from './state.js';

const SAVE_KEY = 'marginalia.save.v1';
const SETTINGS_KEY = 'marginalia.settings.v1';

function storage() {
  try {
    const s = window.localStorage;
    const probe = '__marginalia_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  const s = storage();
  if (!s) return false;
  try {
    const payload = { ...state, savedAt: Date.now() };
    s.setItem(SAVE_KEY, JSON.stringify(payload));
    state.savedAt = payload.savedAt;
    return true;
  } catch (err) {
    console.warn('[save] could not write save', err);
    return false;
  }
}

export function loadGame(knownRooms) {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(SAVE_KEY);
    if (!raw) return null;
    return normaliseState(JSON.parse(raw), knownRooms);
  } catch (err) {
    console.warn('[save] save data is unreadable; ignoring it', err);
    return null;
  }
}

export function hasSave(knownRooms) {
  return loadGame(knownRooms) !== null;
}

export function clearSave() {
  try {
    storage()?.removeItem(SAVE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function loadSettings(defaults) {
  const s = storage();
  if (!s) return { ...defaults };
  try {
    const raw = JSON.parse(s.getItem(SETTINGS_KEY) || '{}');
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (typeof raw[key] === typeof defaults[key]) out[key] = raw[key];
    }
    return out;
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  try {
    storage()?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* settings simply won't persist */
  }
}
