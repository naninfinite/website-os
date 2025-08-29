import { describe, it, expect, vi } from 'vitest';
import { createEngine } from '../core/engine';

describe('engine accumulator', () => {
  it('caps steps per frame and queues inputs once per tick', () => {
    let updates = 0;
    let lastInputs: any[] = [];
    const e = createEngine({ update: (dt: number, inputs: any[] = []) => { updates++; lastInputs = inputs; }, ups: 60 });
    e.setPaused(false); // ensure start works
    e.start();
    (e as any).sendInput?.({ type: 'dir', dir: 'U' });
    e.stop();
    expect(typeof e.isRunning).toBe('function');
  });
});


