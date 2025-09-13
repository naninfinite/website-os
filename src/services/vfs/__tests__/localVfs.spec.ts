/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const vfsPath = '../../vfs/localVfs';

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

async function importVfs() {
  const mod = await import(vfsPath);
  return mod as typeof import('../../vfs/localVfs');
}

describe('localVfs hardened', () => {
  let storage: Storage;
  beforeEach(async () => {
    storage = createMemoryStorage();
    (globalThis as any).localStorage = storage;
    vi.resetModules();
    const vfs = await importVfs();
    vfs.__setStorageForTests(storage);
    vfs.__resetForTests();
    storage.clear();
  });

  it('seeding determinism: hydrate twice yields identical IDs', async () => {
    let vfs = await importVfs();
    await vfs.loadSeeds();
    const firstSnapshot = JSON.stringify(vfs.list('/'));

    // reset storage to force seed rehydrate
    vfs.reset();
    vi.resetModules();
    vfs = await importVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const secondSnapshot = JSON.stringify(vfs.list('/'));
    expect(firstSnapshot).toBe(secondSnapshot);
  });

  it('mkdir/createFile assign ULIDs and rename does not change IDs', async () => {
    const vfs = await importVfs();
    await vfs.loadSeeds();
    const folder = vfs.mkdir('/', 'ULID-Test');
    const file = vfs.createFile('/', 'ulid.txt');
    expect(folder.id).toMatch(/^[0-9A-Z]{26}$/);
    expect(file.id).toMatch(/^[0-9A-Z]{26}$/);
    const oldId = folder.id;
    vfs.renameById(folder.id, 'Renamed-ULID');
    const found = vfs.findById(oldId);
    expect(found?.name).toBe('Renamed-ULID');
    expect(found?.id).toBe(oldId);
  });

  it('atomic writes: mutation failure rolls back persisted snapshot', async () => {
    // Monkey-patch storage.setItem to throw once
    const origSetItem = storage.setItem.bind(storage);
    let threw = false;
    storage.setItem = ((k: string, v: string) => {
      if (!threw && k && v) { threw = true; throw new Error('boom'); }
      return origSetItem(k, v);
    }) as any;

    const vfs = await importVfs();
    await vfs.loadSeeds();
    const before = JSON.stringify((storage as any).getItem('website-os.vfs'));
    expect(() => vfs.mkdir('/', 'WillFail')).toThrow();
    const after = JSON.stringify((storage as any).getItem('website-os.vfs'));
    expect(after).toBe(before);
  });

  it('reset clears snapshot and reloads seeds fresh', async () => {
    let vfs = await importVfs();
    await vfs.loadSeeds();
    vfs.mkdir('/', 'Temp');
    vfs.reset();
    vi.resetModules();
    vfs = await importVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const names = vfs.list('/').map(n => n.name);
    expect(names).not.toContain('Temp');
  });
});


