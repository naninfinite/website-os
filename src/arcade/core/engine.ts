/**
 * SUMMARY
 * Fixed-step game loop engine. Accepts update/render callbacks and manages a
 * deterministic update cadence (UPS). Pauses when document.hidden.
 */

export type EngineOptions = {
  update: (dtMs: number, inputs?: any[]) => void;
  render?: (interpolation: number) => void;
  ups?: number; // updates per second
};

export function createEngine(opts: EngineOptions) {
  const { update, render, ups = 60 } = opts;
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
    while (acc >= stepMs) {
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
    }
    if (render) render(acc / stepMs);
    rafId = requestAnimationFrame(onFrame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    acc = 0;
    rafId = requestAnimationFrame(onFrame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    last = 0;
    acc = 0;
  }

  function setPaused(p: boolean) {
    if (p) stop();
    else start();
  }

  // Visibility handling
  const onVis = () => {
    if (document.hidden) setPaused(true);
    else setPaused(false);
  };
  document.addEventListener('visibilitychange', onVis);

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
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);

  return { start, stop, setPaused, isRunning: () => running, sendInput };
}


