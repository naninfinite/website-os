export type PongState = {
  w: number;
  h: number;
  ball: { x: number; y: number; vx: number; vy: number; r: number };
  p1: { y: number; h: number; score: number };
  p2: { y: number; h: number; score: number; ai?: boolean };
  paddle: { w: number; h: number; speed: number };
  running: boolean;
};

export type PongInput = { p1Up?: boolean; p1Down?: boolean; p2Up?: boolean; p2Down?: boolean };

export function init(width: number, height: number, opts: { ai?: boolean } = {}): PongState {
  const paddleH = Math.max(24, Math.floor(height * 0.2));
  return {
    w: width,
    h: height,
    ball: { x: width / 2, y: height / 2, vx: 0.22, vy: 0.14, r: 3 },
    p1: { y: height / 2 - paddleH / 2, h: paddleH, score: 0 },
    p2: { y: height / 2 - paddleH / 2, h: paddleH, score: 0, ai: !!opts.ai },
    paddle: { w: 6, h: paddleH, speed: 0.3 },
    running: true,
  };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function update(state: PongState, input: PongInput, dtMs: number): PongState {
  const s = { ...state } as PongState;
  const dt = dtMs;
  // move paddles
  if (input.p1Up) s.p1.y -= s.paddle.speed * dt;
  if (input.p1Down) s.p1.y += s.paddle.speed * dt;
  if (!s.p2.ai) {
    if (input.p2Up) s.p2.y -= s.paddle.speed * dt;
    if (input.p2Down) s.p2.y += s.paddle.speed * dt;
  } else {
    // simple AI: follow ball
    if (s.ball.y < s.p2.y + s.p2.h / 2) s.p2.y -= s.paddle.speed * dt * 0.9;
    else s.p2.y += s.paddle.speed * dt * 0.9;
  }
  s.p1.y = clamp(s.p1.y, 0, s.h - s.p1.h);
  s.p2.y = clamp(s.p2.y, 0, s.h - s.p2.h);

  // move ball
  s.ball.x += s.ball.vx * dt;
  s.ball.y += s.ball.vy * dt;

  // top/bottom
  if (s.ball.y - s.ball.r <= 0 || s.ball.y + s.ball.r >= s.h) {
    s.ball.vy = -s.ball.vy;
    s.ball.y = clamp(s.ball.y, s.ball.r, s.h - s.ball.r);
  }

  // paddles
  const p1x = s.paddle.w;
  const p2x = s.w - s.paddle.w;
  if (s.ball.x - s.ball.r <= p1x) {
    if (s.ball.y >= s.p1.y && s.ball.y <= s.p1.y + s.p1.h) {
      // reflect with angle based on contact point
      const rel = (s.ball.y - (s.p1.y + s.p1.h / 2)) / (s.p1.h / 2);
      s.ball.vx = Math.abs(s.ball.vx);
      s.ball.vy = rel * Math.abs(s.ball.vx);
      s.ball.x = p1x + s.ball.r + 1;
    } else {
      // p2 scores
      s.p2.score += 1;
      s.ball.x = s.w / 2;
      s.ball.y = s.h / 2;
      s.ball.vx = Math.abs(s.ball.vx);
      s.ball.vy = 0.14;
    }
  }
  if (s.ball.x + s.ball.r >= p2x) {
    if (s.ball.y >= s.p2.y && s.ball.y <= s.p2.y + s.p2.h) {
      const rel = (s.ball.y - (s.p2.y + s.p2.h / 2)) / (s.p2.h / 2);
      s.ball.vx = -Math.abs(s.ball.vx);
      s.ball.vy = rel * Math.abs(s.ball.vx);
      s.ball.x = p2x - s.ball.r - 1;
    } else {
      s.p1.score += 1;
      s.ball.x = s.w / 2;
      s.ball.y = s.h / 2;
      s.ball.vx = -Math.abs(s.ball.vx);
      s.ball.vy = 0.14;
    }
  }

  // winner check
  if (s.p1.score >= 11 || s.p2.score >= 11) s.running = false;

  // clamp velocities to prevent runaway
  s.ball.vx = clamp(s.ball.vx, -2.0, 2.0);
  s.ball.vy = clamp(s.ball.vy, -2.0, 2.0);

  return s;
}


