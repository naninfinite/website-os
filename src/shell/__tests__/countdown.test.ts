import { describe, it, expect } from 'vitest';

function nextEraName(
  schedule: Array<{ name: string; start?: string; end?: string }>,
  now: Date
) {
  const stamp = (s?: string) => (s ? new Date(s).getTime() : 0);
  const upcoming = schedule
    .map(s => ({ ...s, t: stamp(s.start) || stamp(s.end) }))
    .filter(s => s.t && s.t > now.getTime())
    .sort((a, b) => a.t - b.t)[0];
  return upcoming?.name ?? null;
}

describe('countdown schedule', () => {
  it('finds the next era after now', () => {
    const sched = [
      { name: 'terminal-os', start: '2025-08-01T00:00:00Z', end: '2025-09-01T00:00:00Z' },
      { name: 'os-91',       start: '2025-09-01T00:00:00Z', end: '2025-10-01T00:00:00Z' },
      { name: 'now-os',      start: '2025-10-01T00:00:00Z' }
    ];
    expect(nextEraName(sched, new Date('2025-08-15T00:00:00Z'))).toBe('os-91');
  });
});