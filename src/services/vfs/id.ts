/**
 * SUMMARY
 * Deterministic ID utilities for the VFS:
 * - seedIdForPath: UUID v5 derived from a fixed namespace + canonical path
 * - ulid: monotonic ULID string with device nonce and persisted counters
 *
 * Notes:
 * - Prefers Node crypto or Web Crypto; falls back to a small SHA-1 impl.
 * - Persists `deviceNonce`, `counter`, and `lastTime` in storage to reduce
 *   cross-tab collisions and keep monotonic ordering.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const STORAGE_DEVICE_NONCE_KEY = 'vfs:deviceNonce';
const STORAGE_COUNTER_KEY = 'vfs:idCounter';
const STORAGE_LASTTIME_KEY = 'vfs:idLastTime';

// RFC 4122 DNS namespace UUID (standard static namespace)
const DNS_NAMESPACE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function getStorage(): Storage {
  const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : {});
  const ls: Storage | undefined = g?.localStorage as Storage | undefined;
  if (ls && typeof ls.getItem === 'function') return ls;
  // Memory fallback for Node/tests
  const map = new Map<string, string>();
  const memory: Storage = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => void map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return memory;
}

function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

// Minimal SHA-1 (sync) fallback
function sha1Fallback(message: Uint8Array): Uint8Array {
  // Based on public domain reference implementation; optimized for clarity
  function rol(n: number, s: number): number { return ((n << s) | (n >>> (32 - s))) >>> 0; }
  const ml = message.length;
  const withOne = new Uint8Array(((ml + 9 + 63) >> 6) << 6);
  withOne.set(message);
  withOne[ml] = 0x80;
  const mlBits = ml * 8;
  const view = new DataView(withOne.buffer);
  view.setUint32(withOne.length - 4, mlBits >>> 0);
  view.setUint32(withOne.length - 8, Math.floor(mlBits / 0x100000000));
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const w = new Uint32Array(80);
  for (let i = 0; i < withOne.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4);
    for (let j = 16; j < 80; j++) w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      const s = Math.floor(j / 20);
      const f = s === 0 ? (b & c) | (~b & d)
        : s === 1 ? (b ^ c ^ d)
        : s === 2 ? (b & c) | (b & d) | (c & d)
        : (b ^ c ^ d);
      const k = s === 0 ? 0x5A827999 : s === 1 ? 0x6ED9EBA1 : s === 2 ? 0x8F1BBCDC : 0xCA62C1D6;
      const temp = (rol(a, 5) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = rol(b, 30) >>> 0; b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0); outView.setUint32(4, h1); outView.setUint32(8, h2); outView.setUint32(12, h3); outView.setUint32(16, h4);
  return out;
}

function sha1Sync(data: Uint8Array): Uint8Array {
  // Try Node
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    if (nodeCrypto?.createHash) {
      const hash: any = nodeCrypto.createHash('sha1').update(Buffer.from(data)).digest();
      return new Uint8Array(hash);
    }
  } catch {}
  // Try Web Crypto (sync unavailable); fallback
  return sha1Fallback(data);
}

function utf8Bytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  // Tiny fallback
  const arr: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) arr.push(c);
    else if (c < 0x800) { arr.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else { arr.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }
  return new Uint8Array(arr);
}

export function seedIdForPath(canonicalPath: string): string {
  const nsBytes = uuidToBytes(DNS_NAMESPACE_UUID);
  const nameBytes = utf8Bytes(canonicalPath);
  const data = concatBytes(nsBytes, nameBytes);
  const hash = sha1Sync(data);
  const bytes = hash.slice(0, 16);
  // Set version (5)
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  // Set variant (RFC 4122)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

// Crockford Base32 alphabet
const CROCK = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(time: number): string {
  // 48-bit time -> 10 chars
  let t = Math.floor(time);
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = CROCK.charAt(t % 32) + out;
    t = Math.floor(t / 32);
  }
  return out;
}

function encodeRandom(bytes: Uint8Array): string {
  // 80 bits -> 16 chars
  // Accumulate bits into a number (use BigInt for safety)
  let acc = 0n;
  for (let i = 0; i < bytes.length; i++) acc = (acc << 8n) | BigInt(bytes[i]);
  let out = '';
  for (let i = 0; i < 16; i++) {
    out = CROCK[Number(acc & 0x1fn)] + out;
    acc >>= 5n;
  }
  return out;
}

function getRandomBytes(len: number): Uint8Array {
  const out = new Uint8Array(len);
  const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : {});
  const webCrypto: Crypto | undefined = g?.crypto as Crypto | undefined;
  if (webCrypto?.getRandomValues) { webCrypto.getRandomValues(out); return out; }
  // Node
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    if (nodeCrypto?.randomFillSync) { nodeCrypto.randomFillSync(out); return out; }
  } catch {}
  // Fallback
  for (let i = 0; i < len; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

let cachedDeviceNonce: Uint8Array | null = null;
let lastTimeMs: number | null = null;
let lastRandom: Uint8Array | null = null; // 10 bytes

function loadDeviceNonce(): Uint8Array {
  if (cachedDeviceNonce) return cachedDeviceNonce;
  const storage = getStorage();
  const hex = storage.getItem(STORAGE_DEVICE_NONCE_KEY);
  if (hex && hex.length >= 4) {
    const bytes = new Uint8Array(2);
    bytes[0] = parseInt(hex.slice(0, 2), 16);
    bytes[1] = parseInt(hex.slice(2, 4), 16);
    cachedDeviceNonce = bytes;
    return bytes;
  }
  const bytes = getRandomBytes(2);
  storage.setItem(STORAGE_DEVICE_NONCE_KEY, Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  cachedDeviceNonce = bytes;
  return bytes;
}

function saveClockState(time: number, random: Uint8Array): void {
  const storage = getStorage();
  storage.setItem(STORAGE_LASTTIME_KEY, String(time));
  storage.setItem(STORAGE_COUNTER_KEY, String(((Number(storage.getItem(STORAGE_COUNTER_KEY) ?? '0') | 0) + 1)));
  lastTimeMs = time;
  lastRandom = random;
}

function incrementRandom(random: Uint8Array): Uint8Array {
  const out = random.slice();
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = (out[i] + 1) & 0xff;
    if (out[i] !== 0) break;
  }
  return out;
}

export function ulid(): string {
  const now = Date.now();
  const nonce = loadDeviceNonce();
  let rand: Uint8Array;
  if (lastTimeMs === now && lastRandom) {
    rand = incrementRandom(lastRandom);
  } else {
    rand = getRandomBytes(10);
    // Embed nonce in first 2 bytes to reduce cross-tab collisions
    rand[0] = nonce[0];
    rand[1] = nonce[1];
  }
  saveClockState(now, rand);
  const timePart = encodeTime(now);
  const randPart = encodeRandom(rand);
  return timePart + randPart;
}

export type { };


