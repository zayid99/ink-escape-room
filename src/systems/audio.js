// Web Audio system. Every sound has a synthesised placeholder so the game is fully
// voiced with zero asset files; any sound can be replaced by a real recording via
// src/content/assets.manifest.js (AUDIO). Buses: master → music / sfx / ambience.

import { AUDIO } from '../content/assets.manifest.js';
import { resolveUrl } from '../core/assets.js';

export class AudioSystem {
  constructor(bus, settings) {
    this.bus = bus;
    this.settings = settings;
    this.ctx = null;
    this.buffers = new Map(); // manifest key -> AudioBuffer
    this.ambience = null; // { name, nodes, gain }
    this.windLevel = 0.5;
    this.tension = 0;
    this.musicTimer = null;
    bus.on('settings:changed', () => this.applyVolumes());
  }

  /** Must be called from a user gesture (browser autoplay policy). Safe to call repeatedly. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
    } catch (err) {
      console.warn('[audio] Web Audio unavailable', err);
      return;
    }
    const c = this.ctx;
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.musicBus = c.createGain();
    this.sfxBus = c.createGain();
    this.ambBus = c.createGain();
    for (const b of [this.musicBus, this.sfxBus, this.ambBus]) b.connect(this.master);
    this.noise = this.makeNoise('white');
    this.brown = this.makeNoise('brown');
    this.applyVolumes();
    this.loadManifest();
    if (this.pendingAmbience) this.setAmbience(this.pendingAmbience);
  }

  get ready() {
    return !!this.ctx;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.get('masterVolume'), t, 0.05);
    this.musicBus.gain.setTargetAtTime(s.get('musicVolume'), t, 0.05);
    this.sfxBus.gain.setTargetAtTime(s.get('sfxVolume'), t, 0.05);
    this.ambBus.gain.setTargetAtTime(s.get('ambienceVolume'), t, 0.05);
  }

  async loadManifest() {
    const entries = Object.entries(AUDIO).filter(([, path]) => !!path);
    await Promise.all(
      entries.map(async ([key, path]) => {
        try {
          const res = await fetch(resolveUrl(path));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
          this.buffers.set(key, buf);
        } catch (err) {
          console.warn(`[audio] could not load "${key}" from ${path}; using placeholder`, err);
        }
      }),
    );
  }

  makeNoise(kind) {
    const c = this.ctx;
    const len = c.sampleRate * 2;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === 'brown') {
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = white;
    }
    return buf;
  }

  // ---------- building blocks ----------

  env(gainNode, t, attack, peak, decay) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  out(volume = 1, pan = 0) {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.value = volume;
    if (pan && c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p).connect(this.sfxBus);
    } else g.connect(this.sfxBus);
    return g;
  }

  noiseBurst(dest, t, { dur = 0.2, type = 'lowpass', freq = 800, q = 1, peak = 0.5, attack = 0.005, brown = false, rate = 1 } = {}) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = brown ? this.brown : this.noise;
    src.playbackRate.value = rate;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    this.env(g, t, attack, peak, dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 1.5);
    src.stop(t + attack + dur + 0.05);
    return { src, f, g };
  }

  tone(dest, t, { freq = 440, type = 'sine', dur = 0.5, peak = 0.3, attack = 0.005, glide = 0 } = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + glide), t + attack + dur);
    const g = c.createGain();
    this.env(g, t, attack, peak, dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + attack + dur + 0.05);
    return { o, g };
  }

  // ---------- public API ----------

  /** Play a one-shot effect by name (see SYNTHS). opts: { volume, pan, notes } */
  play(name, opts = {}) {
    if (!this.ctx || this.ctx.state !== 'running') {
      if (this.ctx) this.ctx.resume().catch(() => {});
      if (!this.ctx) return;
    }
    const buf = this.buffers.get(`sfx.${name}`);
    const dest = this.out(opts.volume ?? 1, opts.pan ?? 0);
    const t = this.ctx.currentTime + 0.01;
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = opts.rate ?? 1;
      src.connect(dest);
      src.start(t);
      return;
    }
    const synth = SYNTHS[name];
    if (synth) synth.call(this, dest, t, opts);
    else console.warn(`[audio] unknown sound "${name}"`);
  }

  /** Crossfade to a named ambience bed ('attic' or 'none'). */
  setAmbience(name) {
    if (!this.ctx) {
      this.pendingAmbience = name;
      return;
    }
    if (this.ambience?.name === name) return;
    const c = this.ctx;
    const t = c.currentTime;
    if (this.ambience) {
      const old = this.ambience;
      old.gain.gain.setTargetAtTime(0.0001, t, 0.6);
      setTimeout(() => old.nodes.forEach((n) => n.stop?.()), 3500);
    }
    this.ambience = null;
    if (name === 'none') return;

    const gain = c.createGain();
    gain.gain.value = 0.0001;
    gain.gain.setTargetAtTime(1, t, 1.2);
    gain.connect(this.ambBus);
    const nodes = [];
    const loop = (key, fallback) => {
      const buf = this.buffers.get(key);
      const src = c.createBufferSource();
      src.buffer = buf || fallback;
      src.loop = true;
      src.start(t, Math.random());
      nodes.push(src);
      return { src, real: !!buf };
    };

    // Wind (brown noise through a wandering band-pass), level follows the window.
    const wind = loop('amb.wind', this.brown);
    const windFilter = c.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.6;
    const windGain = c.createGain();
    windGain.gain.value = 0.18 * this.windLevel;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(windFilter.frequency);
    lfo.start(t);
    nodes.push(lfo);
    if (wind.real) wind.src.connect(windGain);
    else wind.src.connect(windFilter).connect(windGain);
    windGain.connect(gain);

    // Rain on the roof.
    const rain = loop('amb.rain', this.noise);
    const rainHp = c.createBiquadFilter();
    rainHp.type = 'highpass';
    rainHp.frequency.value = 1800;
    const rainLp = c.createBiquadFilter();
    rainLp.type = 'lowpass';
    rainLp.frequency.value = 5200;
    const rainGain = c.createGain();
    rainGain.gain.value = 0.028;
    if (rain.real) rain.src.connect(rainGain);
    else rain.src.connect(rainHp).connect(rainLp).connect(rainGain);
    rainGain.connect(gain);

    // House drone: two close low sines that beat slowly.
    const base = this.buffers.get('amb.attic');
    if (base) loop('amb.attic', base).src.connect(gain);
    else {
      for (const f of [55, 58.4]) {
        const o = c.createOscillator();
        o.frequency.value = f;
        const g = c.createGain();
        g.gain.value = 0.022;
        o.connect(g).connect(gain);
        o.start(t);
        nodes.push(o);
      }
    }

    this.ambience = { name, nodes, gain, windGain };
    this.startMusic();
  }

  /** 0..1 — how loud the wind is (window open = loud). */
  setWind(level) {
    this.windLevel = level;
    if (this.ambience && this.ctx) this.ambience.windGain.gain.setTargetAtTime(0.18 * level, this.ctx.currentTime, 0.8);
  }

  /** 0..1 — dissonant music layer that swells during discoveries and scares. */
  setTension(v) {
    this.tension = Math.max(0, Math.min(1, v));
    if (this.tensionGain && this.ctx) this.tensionGain.gain.setTargetAtTime(0.045 * this.tension, this.ctx.currentTime, 1.5);
  }

  /** Brief swell that falls back to the previous level. */
  pulseTension(peak = 0.8, holdMs = 2500) {
    const prev = this.tension;
    this.setTension(Math.max(prev, peak));
    setTimeout(() => this.setTension(prev), holdMs);
  }

  startMusic() {
    if (!this.ctx || this.musicStarted) return;
    this.musicStarted = true;
    const c = this.ctx;
    const t = c.currentTime;

    const tensionBuf = this.buffers.get('music.tension');
    this.tensionGain = c.createGain();
    this.tensionGain.gain.value = 0;
    this.tensionGain.connect(this.musicBus);
    if (tensionBuf) {
      const s = c.createBufferSource();
      s.buffer = tensionBuf;
      s.loop = true;
      s.connect(this.tensionGain);
      s.start(t);
    } else {
      // A minor-second cluster that breathes.
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      lp.connect(this.tensionGain);
      for (const f of [233.1, 246.9, 261.6, 370]) {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 14;
        const g = c.createGain();
        g.gain.value = 0.25;
        o.connect(g).connect(lp);
        o.start(t);
      }
    }

    const baseBuf = this.buffers.get('music.base');
    if (baseBuf) {
      const s = c.createBufferSource();
      s.buffer = baseBuf;
      s.loop = true;
      const g = c.createGain();
      g.gain.value = 0.6;
      s.connect(g).connect(this.musicBus);
      s.start(t);
      return;
    }
    // Placeholder score: sparse low notes from a minor scale, never the same twice.
    const scale = [110, 123.5, 130.8, 146.8, 164.8, 174.6, 196, 220];
    const playPhrase = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + 0.05;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const f = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.2 ? 0.5 : 1);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 700;
        lp.connect(this.musicBus);
        this.tone(lp, now + i * (0.9 + Math.random() * 0.8), { freq: f, type: 'triangle', dur: 3.5, peak: 0.07, attack: 0.02 });
      }
      this.musicTimer = setTimeout(playPhrase, 9000 + Math.random() * 9000);
    };
    this.musicTimer = setTimeout(playPhrase, 4000);
  }
}

// Synthesised placeholders. `this` is the AudioSystem; (dest, t, opts).
const SYNTHS = {
  footstep(dest, t) {
    this.noiseBurst(dest, t, { dur: 0.09, freq: 520 + Math.random() * 200, q: 0.8, peak: 0.22 });
    this.tone(dest, t, { freq: 85 + Math.random() * 15, dur: 0.08, peak: 0.12 });
  },
  door(dest, t) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(130, t + 0.5);
    o.frequency.linearRampToValueAtTime(90, t + 0.9);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 9;
    const g = c.createGain();
    this.env(g, t, 0.08, 0.25, 0.9);
    o.connect(bp).connect(g).connect(dest);
    o.start(t);
    o.stop(t + 1.1);
    this.noiseBurst(dest, t + 0.95, { dur: 0.15, freq: 200, peak: 0.3, brown: true });
  },
  locked(dest, t) {
    for (const dt of [0, 0.13]) {
      this.noiseBurst(dest, t + dt, { dur: 0.08, freq: 300, peak: 0.4, brown: true });
      this.tone(dest, t + dt, { freq: 140, dur: 0.07, peak: 0.15, type: 'square' });
    }
  },
  unlock(dest, t) {
    this.noiseBurst(dest, t, { dur: 0.04, type: 'highpass', freq: 3000, peak: 0.25 });
    this.tone(dest, t + 0.12, { freq: 2400, dur: 0.12, peak: 0.08 });
    this.noiseBurst(dest, t + 0.14, { dur: 0.06, type: 'highpass', freq: 2200, peak: 0.3 });
  },
  pickup(dest, t) {
    this.noiseBurst(dest, t, { dur: 0.12, type: 'highpass', freq: 2500, peak: 0.12 });
    this.tone(dest, t + 0.03, { freq: 659, dur: 0.6, peak: 0.07 });
    this.tone(dest, t + 0.03, { freq: 988, dur: 0.5, peak: 0.04 });
  },
  paper(dest, t) {
    for (let i = 0; i < 4; i++) this.noiseBurst(dest, t + i * 0.05, { dur: 0.06, type: 'bandpass', freq: 3500 + Math.random() * 2500, q: 0.7, peak: 0.12 });
  },
  page(dest, t) {
    const n = this.noiseBurst(dest, t, { dur: 0.32, type: 'bandpass', freq: 1500, q: 0.8, peak: 0.16, attack: 0.04 });
    n.f.frequency.exponentialRampToValueAtTime(5000, t + 0.3);
  },
  pen(dest, t) {
    for (let i = 0; i < 9; i++) this.noiseBurst(dest, t + i * 0.07 + Math.random() * 0.03, { dur: 0.05, type: 'bandpass', freq: 3200 + Math.random() * 1500, q: 2, peak: 0.08 });
  },
  click(dest, t) {
    this.noiseBurst(dest, t, { dur: 0.025, type: 'highpass', freq: 4000, peak: 0.25 });
    this.tone(dest, t, { freq: 1800, dur: 0.03, peak: 0.05 });
  },
  wrong(dest, t) {
    this.noiseBurst(dest, t, { dur: 0.15, freq: 220, peak: 0.4, brown: true });
    this.tone(dest, t, { freq: 98, type: 'sawtooth', dur: 0.35, peak: 0.06 });
    this.tone(dest, t, { freq: 104, type: 'sawtooth', dur: 0.35, peak: 0.06 });
  },
  solve(dest, t) {
    this.tone(dest, t, { freq: 523, dur: 0.9, peak: 0.07 });
    this.tone(dest, t + 0.18, { freq: 784, dur: 1.2, peak: 0.06 });
    this.tone(dest, t + 0.18, { freq: 1568, dur: 0.6, peak: 0.015 });
  },
  sting(dest, t) {
    const c = this.ctx;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(200, t);
    lp.frequency.exponentialRampToValueAtTime(2400, t + 0.25);
    lp.frequency.exponentialRampToValueAtTime(300, t + 2.4);
    lp.connect(dest);
    for (const f of [233, 247, 262, 349, 466]) this.tone(lp, t, { freq: f, type: 'sawtooth', dur: 2.4, peak: 0.05, attack: 0.03, glide: -f * 0.06 });
    this.noiseBurst(dest, t, { dur: 1.6, freq: 1200, q: 0.5, peak: 0.12, attack: 0.05 });
    this.tone(dest, t, { freq: 45, dur: 1.4, peak: 0.3 });
  },
  chirp(dest, t) {
    this.tone(dest, t, { freq: 3300, dur: 0.07, peak: 0.05, attack: 0.002 });
  },
  knock(dest, t) {
    for (const dt of [0, 0.22, 0.31]) {
      this.noiseBurst(dest, t + dt, { dur: 0.08, type: 'bandpass', freq: 700, q: 4, peak: 0.5 });
      this.tone(dest, t + dt, { freq: 173, dur: 0.18, peak: 0.12, type: 'triangle' });
      this.tone(dest, t + dt, { freq: 411, dur: 0.12, peak: 0.05 });
    }
  },
  keydrop(dest, t) {
    this.tone(dest, t, { freq: 2830, dur: 0.4, peak: 0.07 });
    this.tone(dest, t, { freq: 4110, dur: 0.25, peak: 0.04 });
    this.tone(dest, t + 0.16, { freq: 2830, dur: 0.25, peak: 0.03 });
    this.noiseBurst(dest, t + 0.16, { dur: 0.05, type: 'highpass', freq: 2000, peak: 0.1 });
  },
  scrape(dest, t) {
    const n = this.noiseBurst(dest, t, { dur: 1.3, freq: 380, q: 1.5, peak: 0.35, attack: 0.08, brown: true });
    n.f.frequency.linearRampToValueAtTime(620, t + 1.3);
    this.tone(dest, t, { freq: 62, type: 'sawtooth', dur: 1.2, peak: 0.04, attack: 0.1 });
  },
  musicbox(dest, t, opts) {
    const notes = opts.notes || [1047, 988, 784, 659];
    const gap = opts.gap || 0.55;
    notes.forEach((f, i) => {
      this.tone(dest, t + i * gap, { freq: f, dur: 1.4, peak: 0.06 });
      this.tone(dest, t + i * gap, { freq: f * 3.01, dur: 0.3, peak: 0.012 });
    });
  },
  window(dest, t) {
    SYNTHS.door.call(this, dest, t);
    this.noiseBurst(dest, t + 0.2, { dur: 1.2, type: 'bandpass', freq: 600, q: 0.5, peak: 0.25, attack: 0.3, brown: true });
  },
  heartbeat(dest, t) {
    for (const dt of [0, 0.28]) this.tone(dest, t + dt, { freq: 52, dur: 0.22, peak: 0.45, glide: -12 });
  },
};
