import { describe, it, expect } from 'vitest';
import { getActiveEra, type EraScheduleItem } from './services/schedule';

describe('schedule logic', () => {
  it('getActiveEra returns active, next and msUntilFlip', () => {
    const schedule: EraScheduleItem[] = [
      { id: 'terminal-os', start: '2025-09-01T00:00:00Z', end: '2025-10-01T00:00:00Z' },
      { id: 'os-91', start: '2025-10-01T00:00:00Z', end: '2025-11-01T00:00:00Z' },
    ];
    const now = new Date('2025-09-15T00:00:00Z');
    const { active, next, msUntilFlip } = getActiveEra(now, schedule);
    expect(active?.id).toBe('terminal-os');
    expect(next?.id).toBe('os-91');
    expect(msUntilFlip).toBeGreaterThan(0);
  });
});


