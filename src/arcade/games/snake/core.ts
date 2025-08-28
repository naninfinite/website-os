export type SnakeCell = { x: number; y: number };
export type SnakeState = {
  w: number;
  h: number;
  snake: SnakeCell[];
  dir: 'U' | 'D' | 'L' | 'R';
  food: SnakeCell;
  alive: boolean;
  score: number;
};

export type SnakeInput = { dir?: 'U' | 'D' | 'L' | 'R' };

// deterministic PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function init(width: number, height: number, seed = 1): SnakeState {
  const mid = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const snake = [ { x: mid.x, y: mid.y }, { x: mid.x - 1, y: mid.y } ];
  const rng = mulberry32(seed);
  const food = { x: Math.floor(rng() * width), y: Math.floor(rng() * height) };
  return { w: width, h: height, snake, dir: 'R', food, alive: true, score: 0 };
}

function equal(a: SnakeCell, b: SnakeCell) { return a.x === b.x && a.y === b.y; }

export function step(state: SnakeState, input: SnakeInput): SnakeState {
  if (!state.alive) return state;
  const dir = input.dir ?? state.dir;
  const head = { ...state.snake[0] };
  switch (dir) {
    case 'U': head.y -= 1; break;
    case 'D': head.y += 1; break;
    case 'L': head.x -= 1; break;
    case 'R': head.x += 1; break;
  }
  // collisions
  if (head.x < 0 || head.x >= state.w || head.y < 0 || head.y >= state.h) {
    return { ...state, alive: false };
  }
  for (const s of state.snake) if (equal(s, head)) return { ...state, alive: false };

  const newSnake = [head, ...state.snake.slice(0, -1)];
  let newFood = state.food;
  let score = state.score;
  if (equal(head, state.food)) {
    newSnake.push(state.snake[state.snake.length - 1]);
    score += 1;
    // deterministic next food
    const rng = mulberry32(score + head.x + head.y + state.w + state.h);
    newFood = { x: Math.floor(rng() * state.w), y: Math.floor(rng() * state.h) };
  }
  return { ...state, snake: newSnake, dir, food: newFood, score };
}


