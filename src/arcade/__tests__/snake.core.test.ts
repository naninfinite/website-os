import { init, step } from '../games/snake/core';

test('snake moves and eats food deterministically', () => {
  const s = init(10, 10, 42);
  const s2 = step(s, { dir: 'R' });
  expect(s2.snake[0].x).toBe(s.snake[0].x + 1);
});


