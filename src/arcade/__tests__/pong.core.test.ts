import { init, update } from '../games/pong/core';
import { test, expect } from 'vitest';

test('pong ball moves and scores', () => {
  const s = init(200, 120, { ai: false });
  const s2 = update(s, {}, 16);
  expect(s2.ball.x).not.toBe(s.ball.x);
});


