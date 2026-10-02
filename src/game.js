// Game: owns the loop, wires the systems together, and exposes the small scripting
// API that chapter content uses (g.say, g.read, g.give, g.flag, g.goTo, ...).

import { EventBus } from './core/events.js';
import { Input } from './core/input.js';
import { Settings } from './core/settings.js';
import { createInitialState } from './core/state.js';
import { saveGame, loadGame, hasSave, clearSave } from './core/save.js';
import { damp, clamp, vnoise } from './core/math.js';
import { Renderer, VIEW_W } from './render/renderer.js';
import { Player } from './world/player.js';
import { Interaction } from './world/interaction.js';
import { Annotations } from './world/annotations.js';
import { Phantom } from './world/phantom.js';
import { AudioSystem } from './systems/audio.js';
import { Inventory } from './systems/inventory.js';
import { Story } from './systems/story.js';
import { Puzzles } from './systems/puzzles.js';
import { UI } from './ui/ui.js';
import { HUD } from './ui/hud.js';
import { DialogueBox } from './ui/dialogue.js';
import { DocumentViewer } from './ui/documentViewer.js';
import { InventoryPanel } from './ui/inventoryPanel.js';
import { JournalPanel } from './ui/journalPanel.js';
import { MainMenu, PauseMenu, SettingsPanel, ConfirmDialog } from './ui/menus.js';
import { TitleCard, EndScreen } from './ui/screens.js';
import { CONTENT } from './content/index.js';

const NOPE = ['That doesn’t do anything.', 'I can’t see how that helps here.', 'No. Think.', 'Not here.'];

export class Game {
  constructor({ canvas, stage, uiRoot }) {
    this.bus = new EventBus();
    this.settings = new Settings(this.bus);
    this.renderer = new Renderer(canvas, stage);
    this.input = new Input(canvas, this.bus, (x, y) => this.renderer.toLogical(x, y));
    this.audio = new AudioSystem(this.bus, this.settings);
    this.ui = new UI(uiRoot, this.bus);
    this.hud = new HUD(this.ui.hudLayer, {
      onJournal: () => this.openJournal(),
      onInventory: () => this.openInventory(),
      onPause: () => this.openPause(),
      onPutAway: () => this.inventory.hold(null),
    });

    this.rooms = CONTENT.rooms;
    this.items = CONTENT.items;
    this.docs = CONTENT.documents;
    this.state = createInitialState();
    this.player = new Player(this.bus);
    this.interaction = new Interaction(this);
    this.annotations = new Annotations(this);
    this.phantom = new Phantom(this);
    this.inventory = new Inventory(this, this.items);
    this.story = new Story(this, { clues: CONTENT.clues, journal: CONTENT.journal });
    this.puzzles = new Puzzles(this, CONTENT.puzzles);

    this.mode = 'menu';
    this.room = this.rooms[CONTENT.menuRoom];
    this.camX = 0;
    this.busy = false;
    this.roomVersion = 0;
    this.flashlight = { on: true, power: 1, flickerUntil: 0 };
    this.shake = 0;
    this.flash = 0;
    this.time = 0;
    this.touchMode = false;
    this.nextChirp = 25;
    this.saveTimer = null;
    this.roomTimers = {};
    this.ambientQueue = [];

    this.bindInput();
    this.bus.on('player:step', ({ x }) => this.audio.play('footstep', { volume: 0.55, pan: (x - (this.camX + VIEW_W / 2)) / VIEW_W }));
    this.bus.on('ui:changed', () => this.input.clearHeld());
    window.addEventListener('pagehide', () => this.autosaveNow());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.autosaveNow();
    });

    // Browsers only allow audio after a gesture.
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
  }

  // ------------------------------------------------------------------ input

  bindInput() {
    this.bus.on('input:action', ({ action }) => this.onAction(action));
    this.bus.on('input:key', (p) => {
      if (this.ui.blocking()) this.ui.handleKey(p);
    });
    this.bus.on('input:click', (p) => {
      if (p.pointerType === 'touch') this.touchMode = true;
      if (this.ui.handleCanvasClick(p)) return;
      if (this.mode !== 'play' || this.busy) return;
      this.interaction.click(p.x + this.camX, p.y);
    });
  }

  onAction(action) {
    if (this.ui.blocking()) {
      const consumed = this.ui.handleAction(action);
      if (consumed || this.mode !== 'play') return;
      if (action === 'pause') this.openPause();
      return;
    }
    if (this.mode !== 'play') return;
    switch (action) {
      case 'interact':
        if (!this.busy) this.interaction.interactNearest();
        break;
      case 'inventory':
        if (!this.busy) this.openInventory();
        break;
      case 'journal':
        if (!this.busy) this.openJournal();
        break;
      case 'pause':
        this.openPause();
        break;
      case 'flashlight':
        this.flashlight.on = !this.flashlight.on;
        this.audio.play('click', { volume: 0.6 });
        break;
      case 'putAway':
        this.inventory.hold(null);
        break;
      default:
        break;
    }
  }

  // ------------------------------------------------------------------ loop

  start() {
    this.showMainMenu();
    let last = performance.now();
    const frame = (now) => {
      const raw = (now - last) / 1000;
      const dt = Math.min(0.05, raw);
      last = now;
      this.watchPerformance(raw);
      try {
        this.update(dt);
        this.draw();
      } catch (err) {
        console.error('[game] frame failed', err);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /**
   * If frames keep running long (weak GPU, huge screen), lower the render resolution a
   * step at a time. Never raises it again mid-session, so it can't oscillate.
   */
  watchPerformance(raw) {
    if (raw > 0.25 || document.hidden) return; // tab switches and hitches don't count
    this.frameAvg = this.frameAvg === undefined ? raw : this.frameAvg * 0.95 + raw * 0.05;
    this.perfTimer = (this.perfTimer || 0) + raw;
    if (this.perfTimer < 3) return;
    this.perfTimer = 0;
    if (this.frameAvg > 1 / 40 && this.renderer.degrade()) {
      console.info(`[game] frames averaging ${(this.frameAvg * 1000).toFixed(0)} ms; lowering render resolution`);
    }
  }

  update(dt) {
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 2.5);
    this.flash = Math.max(0, this.flash - dt * 1.8);

    if (this.mode === 'menu') {
      const span = Math.max(0, this.room.width - VIEW_W);
      this.camX = span * (0.5 + 0.5 * Math.sin(this.time * 0.05));
      this.player.update(dt, 0, this.room.bounds, null);
      return;
    }
    if (this.ui.worldPaused()) return;

    const st = this.state;
    st.playTime += dt;

    const axis = this.ui.blocking() || this.busy ? 0 : this.input.axis();
    this.player.frozen = this.ui.blocking() || (this.busy && this.player.target === null);
    const aim = this.input.pointerAiming() ? { x: this.input.pointer.x + this.camX, y: this.input.pointer.y } : null;
    this.player.update(dt, axis, this.room.bounds, aim);
    st.player.x = this.player.x;
    st.player.facing = this.player.facing;

    this.interaction.update(dt, this.input.pointerAiming() || this.touchMode ? { x: this.input.pointer.x + this.camX, y: this.input.pointer.y } : null);
    this.phantom.update(dt, this.player, this.flashlight.on && this.flashlight.power > 0.5);

    // Torch flicker.
    const f = this.flashlight;
    if (st.playTime < f.flickerUntil && !this.settings.get('reduceFlicker')) f.power = vnoise(st.playTime * 30) > 0.45 ? 1 : 0.15;
    else f.power = 1;

    // Carbon-monoxide haze drifts toward what the room "breathes".
    const hazeTarget = this.room.hazeTarget ? this.room.hazeTarget(st) : 0.2;
    st.haze = damp(st.haze, hazeTarget, 0.04, dt);

    // The low-battery chirp of an alarm somewhere below. Never explained here.
    if (st.playTime > this.nextChirp) {
      this.nextChirp = st.playTime + 38 + Math.random() * 10;
      this.audio.play('chirp', { volume: 0.35, pan: Math.random() * 1.2 - 0.6 });
    }

    this.room.onUpdate?.(this, dt);

    // Queued ambient moments (a thought, a reaction) play as soon as the player is free.
    if (this.ambientQueue.length && !this.busy && !this.ui.blocking()) this.runScript(this.ambientQueue.shift());

    // Camera eases after the player with a little look-ahead.
    const target = clamp(this.player.x - VIEW_W / 2 + this.player.facing * 40, 0, Math.max(0, this.room.width - VIEW_W));
    this.camX = damp(this.camX, target, 3.2, dt);
  }

  draw() {
    const boilTick = Math.floor(this.time * 10);
    this.renderer.render({
      room: this.room,
      state: this.state,
      t: this.time,
      tick: boilTick,
      camX: this.camX,
      player: this.player,
      phantom: this.phantom,
      annotations: this.annotations,
      focus: this.mode === 'play' ? this.interaction.focus : null,
      hidePrompt: this.ui.blocking() || this.busy,
      settings: this.settings,
      flashlight: this.flashlight,
      shake: this.settings.get('reduceFlicker') ? 0 : this.shake,
      flash: this.settings.get('reduceFlicker') ? 0 : this.flash,
      roomVersion: this.roomVersion,
      game: this,
    });
  }

  /** Something in state changed: redraw static art, schedule an autosave. */
  changed() {
    this.roomVersion++;
    if (this.mode !== 'play') return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.autosave(), 1200);
  }

  autosave() {
    if (this.mode !== 'play') return;
    if (this.busy || this.ui.stack.some((m) => m instanceof DialogueBox)) {
      // Never save half-way through a scripted moment; try again shortly.
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.autosave(), 1500);
      return;
    }
    saveGame(this.state);
  }

  autosaveNow() {
    if (this.mode === 'play' && !this.busy) saveGame(this.state);
  }

  // ------------------------------------------------------------------ flow

  showMainMenu() {
    this.mode = 'menu';
    this.ambientQueue = [];
    this.hud.show(false);
    this.ui.closeAll();
    this.state = createInitialState();
    this.room = this.rooms[CONTENT.menuRoom];
    this.player.place(CONTENT.menuPlayerX, -1);
    this.phantom.clear();
    this.audio.setAmbience('attic');
    this.audio.setWind(0.5);
    const saved = loadGame(Object.keys(this.rooms));
    const info = saved ? `Chapter ${saved.chapter} · ${this.rooms[saved.room].title} · ${formatTime(saved.playTime)}` : '';
    this.ui.open(
      new MainMenu(this.ui, {
        canContinue: !!saved,
        saveInfo: info,
        onContinue: () => this.continueGame(),
        onNew: () => this.confirmNewGame(),
        onSettings: () => this.openSettings(),
      }),
    );
  }

  async confirmNewGame() {
    if (hasSave(Object.keys(this.rooms))) {
      const ok = await this.ui.open(new ConfirmDialog(this.ui, { title: 'Start again?', text: 'Starting a new game will overwrite your saved progress.', yes: 'New game' }));
      if (!ok) return;
    }
    this.newGame();
  }

  async newGame() {
    this.ui.closeAll();
    this.state = createInitialState();
    this.story.unread.clear();
    await this.enterPlay();
    await this.runScript(() => CONTENT.chapters[1].begin(this), { force: true });
  }

  async continueGame() {
    const saved = loadGame(Object.keys(this.rooms));
    if (!saved) {
      this.ui.toast('No saved game found.');
      return;
    }
    this.ui.closeAll();
    this.state = saved;
    await this.enterPlay();
    this.hud.setObjective(this.state.objective, { flash: true });
    this.ui.toast('Progress restored.');
    await this.runScript(async () => CONTENT.chapters[this.state.chapter]?.resume?.(this), { force: true });
  }

  /** Switch into play. Leaves the game busy: the caller's opening script releases it. */
  async enterPlay() {
    this.busy = true;
    await this.ui.fade(true, 300);
    this.mode = 'play';
    this.ambientQueue = [];
    this.roomTimers = {};
    this.inventory.hold(null);
    this.phantom.clear();
    this.flashlight = { on: true, power: 1, flickerUntil: 0 };
    this.nextChirp = this.state.playTime + 20;
    this.loadRoom(this.state.room, this.state.player.x, this.state.player.facing);
    this.camX = clamp(this.player.x - VIEW_W / 2, 0, Math.max(0, this.room.width - VIEW_W));
    this.hud.show(true);
    this.hud.setObjective(this.state.objective, { flash: false });
    await this.ui.fade(false, 500);
  }

  loadRoom(id, x, facing) {
    const room = this.rooms[id];
    if (!room) throw new Error(`Unknown room "${id}"`);
    this.room = room;
    this.state.room = id;
    this.player.footY = room.walkY ?? 304;
    this.player.place(clamp(x ?? room.spawnX ?? room.width / 2, room.bounds.min, room.bounds.max), facing ?? 1);
    this.state.player.x = this.player.x;
    this.state.player.facing = this.player.facing;
    this.audio.setAmbience(room.ambience || 'attic');
    this.audio.setWind(room.wind ? room.wind(this.state) : 0.4);
    this.roomVersion++;
  }

  /** Walk through a door: page-turn fade, change room, run its onEnter script. */
  async goTo(id, { x, facing } = {}) {
    this.player.cancelWalk();
    this.audio.play('door', { volume: 0.6 });
    await this.ui.fade(true, 320);
    this.phantom.clear();
    const from = this.room.id;
    this.loadRoom(id, x, facing);
    this.camX = clamp(this.player.x - VIEW_W / 2, 0, Math.max(0, this.room.width - VIEW_W));
    await this.ui.fade(false, 420);
    saveGame(this.state);
    await this.room.onEnter?.(this, from);
  }

  // ------------------------------------------------------------------ hotspots

  runHotspot(h) {
    if (this.busy || this.ui.blocking()) return Promise.resolve();
    return this.runScript(async () => {
      const held = this.inventory.held;
      if (!held) {
        await h.onInteract?.(this);
        return;
      }
      const ok = h.onUse ? await h.onUse(this, held) : false;
      if (ok) this.inventory.hold(null);
      else await this.say(NOPE[Math.floor(Math.random() * NOPE.length)]);
    });
  }

  /** Run a scripted moment with the player locked out of other interactions. */
  async runScript(fn, { force = false } = {}) {
    if (this.busy && !force) return;
    this.busy = true;
    this.player.cancelWalk();
    try {
      await fn(this);
    } catch (err) {
      console.error('[game] script failed', err);
    } finally {
      this.busy = false;
      this.changed();
    }
  }

  /** Queue a short scripted moment to run when the player is next free. */
  ambient(fn) {
    this.ambientQueue.push(fn);
  }

  async chapterEnd() {
    await CONTENT.chapters[this.state.chapter]?.end?.(this);
  }

  // ------------------------------------------------------------------ panels

  openPause() {
    if (this.mode !== 'play' || this.ui.top() instanceof PauseMenu) return;
    const canLoad = hasSave(Object.keys(this.rooms));
    const pause = new PauseMenu(this.ui, {
      saveInfo: this.state.savedAt ? `Last saved ${new Date(this.state.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '',
      canLoad,
      onJournal: () => this.openJournal(),
      onInventory: () => this.openInventory(),
      onSave: () => (this.busy ? false : saveGame(this.state)),
      onLoad: async () => {
        const ok = await this.ui.open(new ConfirmDialog(this.ui, { title: 'Load last save?', text: 'Anything since your last save will be lost.', yes: 'Load' }));
        if (ok) this.continueGame();
      },
      onSettings: () => this.openSettings(),
      onRestart: async () => {
        const ok = await this.ui.open(new ConfirmDialog(this.ui, { title: 'Restart chapter?', text: 'You will start this chapter again from the beginning.', yes: 'Restart' }));
        if (ok) this.restartChapter();
      },
      onQuit: async () => {
        const ok = await this.ui.open(new ConfirmDialog(this.ui, { title: 'Quit to menu?', text: 'Your progress is saved automatically. You can continue from the main menu.', yes: 'Quit' }));
        if (ok) {
          this.autosaveNow();
          await this.ui.fade(true, 300);
          this.showMainMenu();
          await this.ui.fade(false, 400);
        }
      },
    });
    this.ui.open(pause);
  }

  async restartChapter() {
    const chapter = this.state.chapter;
    this.ui.closeAll();
    this.state = createInitialState();
    this.state.chapter = chapter;
    await this.enterPlay();
    await this.runScript(() => CONTENT.chapters[chapter].begin(this), { force: true });
  }

  openSettings() {
    return this.ui.open(
      new SettingsPanel(this.ui, {
        settings: this.settings,
        hasSave: hasSave(Object.keys(this.rooms)),
        onClearSave: () => clearSave(),
      }),
    );
  }

  boil = () => this.settings.get('lineBoil');

  openJournal(startEntry) {
    if (!this.story.flag('hasJournal')) {
      this.ui.toast('I don’t have my journal. It was on the desk.');
      return Promise.resolve();
    }
    this.audio.play('page');
    const view = this.story.journalView();
    return this.ui.open(
      new JournalPanel(this.ui, {
        ...view,
        boil: this.boil,
        startEntry,
        onRead: (id) => {
          this.story.markRead(id);
          this.story.journalDefs[id]?.onRead?.(this);
        },
      }),
    );
  }

  openInventory() {
    this.audio.play('paper', { volume: 0.6 });
    return this.ui.open(
      new InventoryPanel(this.ui, {
        ids: [...this.state.inventory],
        items: this.items,
        boil: this.boil,
        onExamine: async (id, panel) => {
          const item = this.items[id];
          if (item.examine) await item.examine(this);
          else if (item.doc) await this.read(item.doc);
          else await this.say(item.desc);
          panel.refresh([...this.state.inventory]);
        },
        onUse: (id) => {
          this.inventory.hold(id);
          this.hud.hint(`Holding the ${this.items[id].name}. Interact with something to use it. (Q to put away)`, 5000);
        },
        onCombine: async (a, b, panel) => {
          const recipe = this.inventory.findCombo(a, b);
          if (!recipe) await this.say('They don’t go together.');
          else await recipe(this);
          panel.refresh([...this.state.inventory]);
        },
      }),
    );
  }

  // ------------------------------------------------------------------ scripting API

  /** Show lines of dialogue. Strings, or { text, red, speaker }. */
  say(...lines) {
    const flat = lines.flat().filter(Boolean);
    if (!flat.length) return Promise.resolve();
    return this.ui.open(new DialogueBox(this.ui, flat, { settings: this.settings, audio: this.audio }));
  }

  /** A line written in red pen. */
  red(text) {
    return { text, red: true };
  }

  async read(docId) {
    const doc = this.docs[docId];
    if (!doc) {
      console.error(`[game] unknown document "${docId}"`);
      return;
    }
    this.audio.play('paper');
    await this.ui.open(new DocumentViewer(this.ui, doc, { state: this.state, boil: this.boil, audio: this.audio }));
  }

  give(id, { silent = false } = {}) {
    if (!this.inventory.add(id)) return false;
    if (!silent) {
      this.audio.play('pickup');
      this.ui.toast(`Taken — ${this.items[id].name}`);
    }
    return true;
  }

  take(id) {
    return this.inventory.remove(id);
  }

  has(id) {
    return this.inventory.has(id);
  }

  flag(name) {
    return this.story.flag(name);
  }

  setFlag(name, v = true) {
    this.story.setFlag(name, v);
  }

  addClue(id, opts) {
    return this.story.addClue(id, opts);
  }

  addEntry(id, opts) {
    return this.story.addEntry(id, opts);
  }

  objective(text) {
    this.story.setObjective(text);
  }

  annotate(roomId, a, opts) {
    return this.annotations.add(roomId, a, opts);
  }

  wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  sfx(name, opts) {
    this.audio.play(name, opts);
  }

  scare({ shake = 0.6, flash = 0 } = {}) {
    this.shake = shake;
    this.flash = flash;
    this.audio.play('sting');
    this.audio.pulseTension(1, 4000);
  }

  flickerTorch(seconds = 1.2) {
    this.flashlight.flickerUntil = this.state.playTime + seconds;
  }

  /** Walk the player to x and wait until they arrive (for scripted moments). */
  walkTo(x) {
    return new Promise((resolve) => {
      this.player.walkTo(clamp(x, this.room.bounds.min, this.room.bounds.max), resolve);
    });
  }

  titleCard(opts) {
    return this.ui.open(new TitleCard(this.ui, opts));
  }

  endScreen(opts) {
    return this.ui.open(new EndScreen(this.ui, opts));
  }

  async gameOver({ title, paragraphs }) {
    this.busy = true;
    const choice = await this.endScreen({
      variant: 'gameover',
      eyebrow: 'The journal ends here',
      title,
      paragraphs,
      buttons: [
        { label: 'Load last save', value: 'load', primary: true },
        { label: 'Main menu', value: 'menu' },
      ],
    });
    this.busy = false;
    if (choice === 'load') this.continueGame();
    else this.showMainMenu();
  }

  saveNow() {
    return saveGame(this.state);
  }

  stats() {
    return {
      clues: this.state.clues.length,
      time: formatTime(this.state.playTime),
    };
  }
}

export function formatTime(sec) {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

