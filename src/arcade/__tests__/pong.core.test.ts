/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { init, update } from '../games/pong/core';

describe('pong core (deterministic movement)', () => {
  it('ball advances over several updates', () => {
    // width/height chosen to avoid immediate wall/paddle collisions
    const s0 = init(200, 120, { ai: false });
    const x0 = s0.ball.x;
    const y0 = s0.ball.y;
    // advance ~10 frames at ~16ms (≈60 UPS friendly)
    let s = s0;
    for (let i = 0; i < 10; i++) {
      s = update(s, {}, 16);
    }
    expect(s.ball.x).not.toBe(x0);
    expect(s.ball.y).not.toBe(y0);
  });

  it('scores eventually when ball travels far enough (no hard timing)', () => {
    const s0 = init(200, 120, { ai: false });
    let s = s0;
    // step a bunch; we don't assert exact frame, only that score changes eventually.
    for (let i = 0; i < 400; i++) {
      s = update(s, {}, 16);
    }
    // One side should have scored at least once by now in default serve direction
    const totalScore = s.p1.score + s.p2.score;
    expect(totalScore).toBeGreaterThanOrEqual(1);
  });
});

describe('pong core', () => {
  it('ball moves after enough updates', () => {
    const s = init(200, 120, { ai: false });
    const x0 = s.ball.x;
    let s2 = s;
    for (let i = 0; i < 15; i++) {
      s2 = update(s2, {}, 16); // ~240ms to ensure movement
    }
    // Assert ball moved horizontally or vertically
    expect(s2.ball.x).not.toBe(x0);
    expect(Math.abs(s2.ball.x - x0)).toBeGreaterThan(0);
  });
});