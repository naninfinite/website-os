ADR-00X: Terminal-OS Arcade Renderers Use Green-on-Black Canvas (Nokia/Pong style)

Status

Accepted — Sprint 1

Context

Arcade.EXE ships with Pong and Snake. Our first pass used ASCII/DOM dots for Terminal-OS. The desired aesthetic for Terminal-OS is the sharp, blocky green-on-black look (Nokia Snake / retro monitor), and these games are a key “wow” alongside Dimension.EXE. We must keep the deterministic, testable game cores and only change renderers.

Decision

For Terminal-OS only, replace ASCII renderers with canvas renderers that:
	•	Use a fixed internal resolution (e.g., Snake 128×96, Pong 320×180), scaled up with nearest-neighbor (no smoothing) to preserve chunky pixels.
	•	Palette: #00FF66-ish green on black via existing theme CSS variables (no raw hex in components).
	•	Foreground: var(--fg), Background: var(--bg), Accent grid/border via var(--chrome) as needed.
	•	Nokia Snake visual rules:
	•	Thick single-pixel “cells”; snake = filled blocks; food = small cross/diamond; 1-px inner border around playfield.
	•	Atari Pong visual rules:
	•	Solid paddles, square ball, optional dashed center line; minimal score glyphs.
	•	Respect prefers-reduced-motion (no flashy transitions).
	•	Keep game cores unchanged; only Terminal renderer modules change.

Alternatives Considered
	•	ASCII grid (existing): lightweight but visually underwhelming → rejected.
	•	WebGL: overkill for scope; hurts readability → rejected.
	•	SVG: viable but canvas is simpler/faster for pixel scaling → rejected for Terminal.

Scope
	•	Affects: src/arcade/renderers/terminal/{PongRenderer,SnakeRenderer}.tsx (+ small CSS additions).
	•	Leaves: cores (games/*), engine, OS-91/Now renderers unchanged (they can evolve separately).

Implementation Notes
	•	Create <canvas> with fixed logical size; on resize, compute integer scale that fits container; set ctx.imageSmoothingEnabled = false.
	•	Read colors from theme vars via computed style (or pass from parent).
	•	Snake: draw grid border, snake blocks, food cross, optional light screen-noise (very subtle).
	•	Pong: paddles, ball, dashed midline, tiny bitmap digits.
	•	Keep render function pure w.r.t. provided state; no timers inside renderer.

Testing / Acceptance
	•	Games are playable via keyboard and mobile overlay; inputs feel immediate.
	•	Visuals match Nokia/Pong references (blocky, crisp; no blur).
	•	Theme swap (era change) does not break render; Terminal uses green/black.
	•	No regressions in unit tests; FPS remains steady; engine timing unchanged.

Risks & Mitigations
	•	Blurry scaling on some DPRs → force integer scaling, disable smoothing.
	•	Color mismatch → drive through CSS vars; no hardcoded hex.
	•	Performance on mobile → draw minimal primitives; reuse buffers where possible.

Migration
	•	Remove ASCII markup/styles tied to old Terminal renderers.
	•	Keep OS-91/Now renderers as-is (can polish later).

Non-Goals
	•	Advanced shaders, sound, or game design changes.
	•	Changing input model or engine timing.