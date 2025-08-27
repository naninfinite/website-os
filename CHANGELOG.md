# Changelog
All notable changes to this project will be documented here, following “Keep a Changelog”.

## [Unreleased]
- Scaffold Chunk 1: layoutProfiles + shell baseline
- Scaffold Chunk 2: themes + reboot/countdown logic (tokens expanded, eraThemes, RebootOverlay, real Countdown)
- Scaffold Chunk 3: WindowManager MVP (open/move/minimize/restore, focus/z-order, taskbar)
- Added app stubs and registry wiring for Sprint 1.
- Bind active era to body theme/layout via EraProvider; added dev-era badge.
- Initial Vite + React + TS scaffold (index.html, vite, tsconfig, Tailwind)
- Add schedule loader + countdown hook + CountdownBadge component
- Add layoutProfiles contract and era mappings (Terminal-OS, OS-91, Now-OS)
- Basic test for schedule logic (getActiveEra)
- Repo hygiene files added (editorconfig, prettierrc, nvmrc, LICENSE, CONTRIBUTING, env.example, gitignore updates)
- Add PR template + CI
- Fixed: Completed appRegistry scaffold (missing app stubs, unfinished export).
- Added: Temporary VITE_FORCE_ERA override for local testing.

## [2025-08-27] Scaffold 4 Complete
- Registered all core apps in `appRegistry`:
  - About, Projects, Gallery, Settings
  - Connect, Arcade, Dimension, Terminal
- Fixed import paths and resolved missing file errors.
- Implemented `VITE_FORCE_ERA` override for development testing.
- Verified era switching logic now surfaces in UI.
### [Unreleased]

- Refactored `appMeta` exports into dedicated `meta.ts` files per app.  
- Updated `appRegistry` to import from `meta.ts` for type safety and to fix HMR warnings.  
- Added Cursor rules note to enforce `AppMeta` contract consistently.