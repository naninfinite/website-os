/**
 * SUMMARY
 * Session-only customize toggle for Home Dashboard. Uses a module-level
 * EventTarget to notify listeners across the app without persistence.
 */

const bus = new EventTarget();
let value = false;

export function setHomeCustomize(next: boolean): void {
  if (value === next) return;
  value = next;
  bus.dispatchEvent(new CustomEvent('homeCustomize', { detail: value }));
}

export function getHomeCustomize(): boolean {
  return value;
}

export function subscribeHomeCustomize(cb: (v: boolean) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail);
  bus.addEventListener('homeCustomize', handler);
  return () => bus.removeEventListener('homeCustomize', handler);
}


