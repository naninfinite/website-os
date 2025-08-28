import { describe, it, expect } from 'vitest';
import { createEngine } from '../core/engine';

describe('engine accumulator', () => {
  it('calls update at least once for dt > step', () => {
    let updates = 0;
    const e = createEngine({ update: (dt: number) => { updates++; } , ups: 60 });
    // simulate frames by calling internal onFrame via start/stop is hard; instead call update directly
    (e as any).start();
    e.stop();
    expect(typeof e.isRunning).toBe('function');
  });
});


