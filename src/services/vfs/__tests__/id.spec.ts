/* @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const modPath = '../../vfs/id';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => void map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  } as unknown as Storage;
}

describe('vfs id utilities', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = createMemoryStorage();
    (globalThis as any).localStorage = storage;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-14T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as any).localStorage;
  });

  it('seedIdForPath is deterministic for a canonical path', async () => {
    const { seedIdForPath } = await import(modPath);
    const a = seedIdForPath('/Desktop/README.txt');
    const b = seedIdForPath('/Desktop/README.txt');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('ulid is monotonic for same tick and unique across many calls', async () => {
    const { ulid } = await import(modPath);
    const list: string[] = [];
    for (let i = 0; i < 5000; i++) list.push(ulid());
    const sorted = [...list].sort();
    expect(list).toEqual(sorted); // monotonic within same ms tick
    expect(new Set(list).size).toBe(list.length); // no collisions
  });

  it('ulid advances over time ticks', async () => {
    const { ulid } = await import(modPath);
    const a = ulid();
    vi.setSystemTime(new Date('2025-09-14T00:00:01Z'));
    const b = ulid();
    expect(b > a).toBe(true);
  });
});


