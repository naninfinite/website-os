/**
 * SUMMARY
 * Lightweight JSON loaders for content/ JSON files. Module-level memoization
 * is used to cache results per session. Loaders validate minimal shape and
 * return [] on error (with a console.warn).
 */

import type { Project, Media, Lore } from './types';

let _projects: Project[] | null = null;
let _media: Media[] | null = null;
let _lore: Lore[] | null = null;

function isArrayOf(obj: unknown, check: (v: any) => boolean): boolean {
  return Array.isArray(obj) && obj.every(check);
}

export async function loadProjects(): Promise<Project[]> {
  if (_projects) return _projects;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}content/projects.json`);
    const json = await res.json();
    const items = json?.projects ?? [];
    if (!isArrayOf(items, (i) => i && typeof i.id === 'string' && typeof i.title === 'string')) {
      console.warn('[loadProjects] invalid projects shape');
      _projects = [];
      return _projects;
    }
    // normalize minimal fields
    _projects = items.map((p: any) => ({
      id: String(p.id),
      title: String(p.title),
      blurb: p.summary ?? p.blurb ?? '',
      tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
      url: p.links?.live || p.url || undefined,
      repo: p.links?.repo || p.repo || undefined,
      year: typeof p.year === 'number' ? p.year : undefined,
    }));
    return _projects;
  } catch (err) {
    console.warn('[loadProjects] failed to load', err);
    _projects = [];
    return _projects;
  }
}

export async function loadMedia(): Promise<Media[]> {
  if (_media) return _media;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}content/media.json`);
    const json = await res.json();
    const items = json?.assets?.[0]?.assets ?? json?.assets ?? [];
    if (!isArrayOf(items, (i) => i && typeof i.id === 'string' && typeof i.src === 'string')) {
      console.warn('[loadMedia] invalid media shape');
      _media = [];
      return _media;
    }
    _media = items.map((m: any) => ({
      id: String(m.id),
      title: String(m.title ?? m.id),
      src: String(m.src),
      alt: String(m.alt ?? m.title ?? ''),
      kind: m.type === 'video' ? 'video' : 'image',
      credit: m.credit ?? undefined,
      tags: Array.isArray(m.tags) ? m.tags.map(String) : undefined,
    }));
    return _media;
  } catch (err) {
    console.warn('[loadMedia] failed to load', err);
    _media = [];
    return _media;
  }
}

export async function loadLore(): Promise<Lore[]> {
  if (_lore) return _lore;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}content/lore.json`);
    const json = await res.json();
    const items = json?.messages ?? [];
    if (!isArrayOf(items, (i) => i && typeof i.key === 'string' && typeof i.text === 'string')) {
      console.warn('[loadLore] invalid lore shape');
      _lore = [];
      return _lore;
    }
    _lore = items.map((m: any, idx: number) => ({ id: String(m.key ?? idx), key: String(m.key), value: String(m.text) }));
    return _lore;
  } catch (err) {
    console.warn('[loadLore] failed to load', err);
    _lore = [];
    return _lore;
  }
}

export function clearContentCache(): void {
  _projects = null;
  _media = null;
  _lore = null;
}


