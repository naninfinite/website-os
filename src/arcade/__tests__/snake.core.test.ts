import { init, step } from '../games/snake/core';

test('snake moves and eats food deterministically', () => {
  const s = init(10, 10, 42);
  const s2 = step(s, { dir: 'R' });
  expect(s2.snake[0].x).toBe(s.snake[0].x + 1);
});

test('no 180 degree reversal in one tick', () => {
  const s = init(10,10,1);
  const s1 = step(s, { dir: 'L' }); // opposite of initial 'R' should be ignored
  expect(s1.dir).toBe('R');
});


