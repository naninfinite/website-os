/**
 * SUMMARY
 * Simple recents tracker backed by localStorage. Stores the most recent items
 * (apps/files), deduped by (type,id), newest first.
 */

export type RecentType = 'app' | 'file';
export type RecentItem = {
  type: RecentType;
  id: string;
  title: string;
  ts: number; // epoch ms
};

const STORAGE_KEY = 'recents:v1';
const LIMIT = 12;

function readStore(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentItem[];
    if (!Array.isArray(list)) return [];
    return list.filter((it) => it && typeof it.id === 'string' && (it.type === 'app' || it.type === 'file'));
  } catch {
    return [];
  }
}

function writeStore(items: RecentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, LIMIT)));
  } catch {
    // ignore quota errors
  }
}

export function addRecent(type: RecentType, id: string, title: string): void {
  const now = Date.now();
  const items = readStore();
  const key = `${type}:${id}`;
  const filtered = items.filter((it) => `${it.type}:${it.id}` !== key);
  filtered.unshift({ type, id, title, ts: now });
  writeStore(filtered);
}

export function getRecents(): RecentItem[] {
  const items = readStore();
  return items.sort((a, b) => b.ts - a.ts).slice(0, LIMIT);
}


