export type GameId = 'pong' | 'snake';
export type RendererId = 'terminal' | 'os91' | 'now';
export type ArcadeInput =
  | { type: 'dir'; dir: 'U' | 'D' | 'L' | 'R' }
  | { type: 'action'; id: string }
  | { type: 'pause' }
  | { type: 'reset' };


