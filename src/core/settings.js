// Player-facing settings with persistence. Systems subscribe via the event bus.

import { loadSettings, saveSettings } from './save.js';

export const DEFAULT_SETTINGS = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  ambienceVolume: 0.7,
  /** Characters per second for dialogue; 0 = instant. */
  textSpeed: 45,
  /** 0 = still lines, 1 = full hand-drawn boil. */
  lineBoil: 1,
  /** Reduce candle flicker, flashes and screen shake. */
  reduceFlicker: false,
};

export class Settings {
  constructor(bus) {
    this.bus = bus;
    this.values = loadSettings(DEFAULT_SETTINGS);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && !localStorageHasSettings()) {
      this.values.reduceFlicker = true;
      this.values.lineBoil = 0.4;
    }
  }

  get(key) {
    return this.values[key];
  }

  set(key, value) {
    if (!(key in DEFAULT_SETTINGS)) return;
    this.values[key] = value;
    saveSettings(this.values);
    this.bus.emit('settings:changed', { key, value, all: this.values });
  }
}

function localStorageHasSettings() {
  try {
    return window.localStorage.getItem('marginalia.settings.v1') !== null;
  } catch {
    return false;
  }
}
