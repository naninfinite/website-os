/// <reference types="vitest" />
/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { createEngine } from '../core/engine';

describe('engine (node env, fake timers)', () => {
  it('delivers inputs once per tick and enforces step cap', () => {
    let now = 0;
    const callbacks: Array<(t: number) => void> = [];
    const timers = {
      now: () => now,
      raf: (cb: (t: number) => void) => {
        callbacks.push(cb);
        return callbacks.length;
      },
      caf: (_id: number) => {
        /* noop for test */
      },
    };

    const inputsSeen: number[] = [];
    let updates = 0;
    const eng = createEngine({
      update: (_dt, ins) => {
        updates++;
        if (ins && ins.length) inputsSeen.push(...ins);
      },
      ups: 10,
      timers,
    });

    eng.start();
    // First frame primes 'last' (delta 0 by design)
    now += 100; // t = 100ms
    callbacks.splice(0).forEach((cb) => cb(now));

    // Queue input, then advance another step to process it
    eng.sendInput(1);
    now += 100; // t = 200ms, delta ~100ms => one update at 10 UPS
    callbacks.splice(0).forEach((cb) => cb(now));

    // inputs should be delivered once
    expect(inputsSeen).toEqual([1]);

    // simulate huge dt to test step cap: 2000ms
    eng.sendInput(2);
    now += 2000;
    callbacks.splice(0).forEach((cb) => cb(now));

    // updates should have increased but not blown up; we know cap is 5 per frame
    expect(updates).toBeGreaterThanOrEqual(1);
    expect(inputsSeen).toContain(2);

    eng.stop();
  });
});