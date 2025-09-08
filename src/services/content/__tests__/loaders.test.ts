/* @vitest-environment node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadProjects, loadMedia, loadLore, clearContentCache } from '../loaders';

const okResponse = (data: any) =>
  Promise.resolve({
    ok: true,
    json: async () => data,
  } as unknown as Response);

const badResponse = (data: any) =>
  Promise.resolve({
    ok: true,
    json: async () => data,
  } as unknown as Response);

beforeEach(() => {
  vi.restoreAllMocks();
  clearContentCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('content loaders', () => {
  it('parses projects JSON (happy path)', async () => {
    const data = { projects: [{ id: 'p1', title: 'Test', tags: ['demo'], links: { live: '#' } }] };
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(() => okResponse(data));
    const res = await loadProjects();
    expect(res).toEqual([
      { id: 'p1', title: 'Test', blurb: '', tags: ['demo'], url: '#', repo: undefined, year: undefined },
    ]);
  });

  it('parses media JSON (happy path)', async () => {
    const data = { assets: [{ id: 'm1', title: 'Image', alt: 'Alt', src: '/img.png', type: 'image' }] };
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(() => okResponse(data));
    const res = await loadMedia();
    expect(res).toEqual([
      { id: 'm1', title: 'Image', src: '/img.png', alt: 'Alt', kind: 'image', credit: undefined, tags: undefined },
    ]);
  });

  it('parses lore JSON (happy path)', async () => {
    const data = { messages: [{ key: 'bio', text: 'Hi' }] };
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(() => okResponse(data));
    const res = await loadLore();
    expect(res).toEqual([{ id: 'bio', key: 'bio', value: 'Hi' }]);
  });

  it('returns [] and warns on invalid projects payload', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalid = { projects: { not: 'an array' } };
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(() => badResponse(invalid));
    const res = await loadProjects();
    expect(res).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });
});