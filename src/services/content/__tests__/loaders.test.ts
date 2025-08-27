import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadProjects, loadMedia, loadLore, clearContentCache } from '../loaders';

// Mock fetch globally
const originalFetch = globalThis.fetch;

beforeEach(() => {
  clearContentCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

function mockFetch(json: unknown) {
  globalThis.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(json) } as any)) as any;
}

describe('content loaders', () => {
  it('parses projects JSON', async () => {
    mockFetch({ projects: [{ id: 'p1', title: 'P1' }] });
    const res = await loadProjects();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('p1');
  });

  it('parses media JSON', async () => {
    mockFetch({ assets: [{ version: 1, assets: [{ id: 'm1', src: 'x.png', title: 'M1' }] }] });
    const res = await loadMedia();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('m1');
  });

  it('parses lore JSON', async () => {
    mockFetch({ messages: [{ key: 'about', text: 'hello' }] });
    const res = await loadLore();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].key).toBe('about');
  });

  it('returns [] and warns on invalid projects', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch({ bad: true });
    const res = await loadProjects();
    expect(res).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });

  it('caches results and clearContentCache resets', async () => {
    mockFetch({ projects: [{ id: 'c1', title: 'C1' }] });
    const first = await loadProjects();
    expect(first[0].id).toBe('c1');
    // change mock to different data but since cache present, loader should return cached
    mockFetch({ projects: [{ id: 'c2', title: 'C2' }] });
    const second = await loadProjects();
    expect(second[0].id).toBe('c1');
    clearContentCache();
    const third = await loadProjects();
    expect(third[0].id).toBe('c2');
  });
});


