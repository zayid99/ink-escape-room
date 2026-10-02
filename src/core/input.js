// Keyboard + pointer input mapped to game actions.
// Held state (left/right) is polled each frame; discrete presses are emitted on the bus
// as `input:action` so the UI can intercept them while a modal is open.

const BINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  interact: ['KeyE', 'Space', 'Enter'],
  inventory: ['KeyI', 'Tab'],
  journal: ['KeyJ'],
  pause: ['Escape', 'KeyP'],
  flashlight: ['KeyF'],
  putAway: ['KeyQ'],
};

const CODE_TO_ACTION = new Map();
for (const [action, codes] of Object.entries(BINDINGS)) {
  for (const code of codes) CODE_TO_ACTION.set(code, action);
}

export class Input {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('./events.js').EventBus} bus
   * @param {(clientX:number, clientY:number) => {x:number,y:number}|null} toLogical
   */
  constructor(canvas, bus, toLogical) {
    this.canvas = canvas;
    this.bus = bus;
    this.toLogical = toLogical;
    this.held = new Set();
    /** Pointer in logical screen coordinates (0..640, 0..360). */
    this.pointer = { x: 0, y: 0, inside: false, lastMove: -Infinity };
    this.lastKeyboardUse = -Infinity;

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('blur', () => this.held.clear());

    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    canvas.addEventListener('pointerleave', () => {
      this.pointer.inside = false;
    });
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.bus.emit('input:action', { action: 'putAway', source: 'pointer' });
    });
  }

  onKeyDown(e) {
    const action = CODE_TO_ACTION.get(e.code);
    // Let form controls (settings sliders) keep their keys.
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    // Focused buttons keep native keyboard behaviour (Enter/Space activate, Tab moves focus).
    if ((tag === 'BUTTON' || tag === 'A') && (e.code === 'Enter' || e.code === 'Space' || e.code === 'Tab')) return;
    if (!action) {
      if (/^Digit\d$|^Numpad\d$|^Backspace$|^ArrowUp$|^ArrowDown$/.test(e.code)) {
        this.bus.emit('input:key', { code: e.code, key: e.key, event: e });
      }
      return;
    }
    e.preventDefault();
    this.lastKeyboardUse = performance.now();
    if (action === 'left' || action === 'right') {
      this.held.add(action);
      this.bus.emit('input:key', { code: e.code, key: e.key, event: e });
      return;
    }
    if (e.repeat) return;
    this.bus.emit('input:action', { action, source: 'keyboard', code: e.code });
  }

  onKeyUp(e) {
    const action = CODE_TO_ACTION.get(e.code);
    if (action === 'left' || action === 'right') this.held.delete(action);
  }

  onPointerMove(e) {
    const p = this.toLogical(e.clientX, e.clientY);
    if (!p) return;
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.inside = true;
    if (e.pointerType === 'mouse') this.pointer.lastMove = performance.now();
  }

  onPointerDown(e) {
    const p = this.toLogical(e.clientX, e.clientY);
    if (!p) return;
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.inside = true;
    this.pointer.lastMove = performance.now();
    if (e.button === 2) return;
    this.bus.emit('input:click', { x: p.x, y: p.y, pointerType: e.pointerType });
  }

  /** -1, 0 or 1 from held movement keys. */
  axis() {
    return (this.held.has('right') ? 1 : 0) - (this.held.has('left') ? 1 : 0);
  }

  /** True while the mouse has moved recently — the torch follows the cursor. */
  pointerAiming() {
    return this.pointer.inside && performance.now() - this.pointer.lastMove < 4000 && this.pointer.lastMove > this.lastKeyboardUse;
  }

  clearHeld() {
    this.held.clear();
  }
}
