# ADR-TERMINAL-SCOPE: Terminal.EXE Scope and Intent

## Status
Accepted — PR-3 (2025-09-13)

## Context
The project spans three eras (Terminal-OS → OS-91 → Now-OS) while keeping the same apps/content. Terminal.EXE exists in all eras but must not become the primary shell at this stage. We need to lock scope to ensure consistent UX, tests, and documentation.

## Decision
- Terminal.EXE is a **toy shell** for discovery and fun, not the primary system shell.
- It exposes a **whitelisted command set** and rejects unknown commands consistently.
- It does not perform destructive actions, file writes, or privileged operations.
- The UI presents a CRT-style prompt of the form: `guest@website-os:<era> $ `.

## Command Whitelist (v1)
- `help` — Show help with available commands
- `apps` — List registered apps from the App Registry
- `open <appId>` — Request opening an app by id (UI decides how/where)
- `clear` — Clear the terminal screen buffer
- `echo <text>` — Print text back
- `time` — Show current UTC and local time
- `era` — Show the active era (and preview availability)
- `theme <terminal-os|os-91|now-os>` — Preview an era when preview is allowed (disabled when `VITE_FORCE_ERA` is set)

Any non-whitelisted command must respond: `Unknown command: <cmd>. Type 'help'`.

## Non-Goals
- No full shell features (pipes, redirects, scripting, history search, auto-complete)
- No file system mutations or network commands
- No authentication or permission model
- No elevation or privileged toggles

## Consequences
- Tests will enforce the whitelist behavior and unknown handling.
- README documents the scope, prompt format, and command table.
- Future expansion requires updating this ADR (or a superseding ADR) and adding tests.

## References
- `src/apps/terminal/parser.ts` — pure parser with whitelisted commands
- `src/apps/terminal/index.tsx` — UI with CRT prompt and input handling
- `src/shell/appRegistry.ts` — registry of apps surfaced by `apps` and `open`
