/**
 * SUMMARY
 * Fixed-step game loop engine. Accepts update/render callbacks and manages a
 * deterministic update cadence (UPS). Pauses when document.hidden.
 */

export type EngineOptions = {
  update: (dtMs: number, inputs?: any[]) => void;
  render?: (interpolation: number) => void;
  ups?: number; // updates per second
  timers?: { now: () => number; raf: (cb: FrameRequestCallback) => number; caf: (id: number) => void };
};

export function createEngine(opts: EngineOptions) {
  const { update, render, ups = 60 } = opts;
  const hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
  const hasRAF = typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function';
  const timers = opts.timers ?? {
    now: hasPerf ? performance.now.bind(performance) : Date.now,
    raf: hasRAF
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => setTimeout(() => cb((Date.now() as unknown as number)), 16) as unknown as number,
    caf: hasRAF ? cancelAnimationFrame : (id: number) => clearTimeout(id as unknown as any),
  };
  const stepMs = 1000 / ups;
  let running = false;
  let last = 0;
  let acc = 0;
  let rafId: number | null = null;
  const inputQueue: any[] = [];

  function sendInput(i: any) {
    inputQueue.push(i);
  }

  function onFrame(ts: number) {
    if (!running) return;
    if (!last) last = ts;
    let delta = ts - last;
    // clamp to avoid spiral if tab was hidden for long
    if (delta > 1000) delta = 1000;
    last = ts;
    acc += delta;
    let processed = 0;
    while (acc >= stepMs && processed < 5) {
      // snapshot inputs for this tick
      const inputs = inputQueue.splice(0, inputQueue.length);
      // call update with dt and inputs array
      try {
        (update as any)(stepMs, inputs);
      } catch (err) {
        // swallow to avoid breaking loop
        console.warn('[engine] update error', err);
      }
      acc -= stepMs;
      processed++;
    }
    if (render) render(acc / stepMs);
    rafId = timers.raf(onFrame);
  }

  function start() {
    if (running) return;
    running = true;
    last = timers.now();
    acc = 0;
    rafId = timers.raf(onFrame);
  }

  function stop() {
    running = false;
    if (rafId) timers.caf(rafId);
    rafId = null;
    last = 0;
    acc = 0;
  }

  function setPaused(p: boolean) {
    if (p) stop();
    else start();
  }

  // Visibility handling
  const hasDocument = typeof document !== 'undefined';
  const hasWindow = typeof window !== 'undefined';
  const onVis = () => {
    if (hasDocument && (document as any).hidden) setPaused(true);
    else setPaused(false);
  };
  if (hasDocument && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', onVis);
  }

  // Blur/focus handling with debounce to avoid flapping
  let focusTimeout: number | null = null;
  const onBlur = () => {
    setPaused(true);
  };
  const onFocus = () => {
    if (focusTimeout) window.clearTimeout(focusTimeout);
    focusTimeout = window.setTimeout(() => {
      setPaused(false);
      focusTimeout = null;
    }, 120);
  };
  if (hasWindow && typeof window.addEventListener === 'function') {
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
  }

  return { start, stop, setPaused, isRunning: () => running, sendInput };
}


