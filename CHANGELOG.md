# Changelog
All notable changes to this project will be documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- Refactored `appMeta` exports into dedicated `meta.ts` files per app  
- Updated `appRegistry` to import from `meta.ts` for type safety and to fix HMR warnings  
- Settings.EXE with theme, wallpaper, accessibility, and gesture toggles
- Theme tokens split into `tokens.css` and `eraThemes.css`
- EraContext user prefs with instant application & persistence
 - Desktop home behavior by era: Terminal-OS `homeMode='none'`, OS-91/Now-OS `homeMode='icons'`; desktop icons grid, keyboard navigation, and launcher hotkey
 - Content loaders and seed JSON for About/Projects/Gallery (`content/*.json`, `src/services/content/*`)
 - Added ADR-001: Decision on Terminal.EXE navigation role (Toy Shell vs Primary Shell)
 - Testing: added unit tests for content loaders and cache behavior (`src/services/content/__tests__/loaders.test.ts`)
 - Settings.EXE: Respect Reduced Motion toggle, Theme Preview with reset, Clear Content Cache
 - Terminal.EXE: toy shell with commands (help, apps, open, clear, echo, time, era, theme)
 - Arcade v1 scaffold: Pong and Snake deterministic cores, terminal renderers, engine loop, and core tests
 - Arcade glue: games playable in `Arcade.EXE` (ArcadeSurface, engine wiring, mobile controls)
 - CountdownBadge inline variant for headers; HomeDashboard header shows inline countdown with quick launchers for Terminal.EXE and Dimension.EXE on Terminal-OS desktop
### Fixed
 - Windowing provider placement and unified `useWindowing` import path; resolved provider runtime error

---

## [2025-08-27] Sprint 1 Complete
### Added
- **Era layout profiles** (`src/themes/layoutProfiles.ts`) for Terminal-OS, OS-91, Now-OS  
- **Desktop windowing MVP** (`src/shell/windowing/WindowManager.tsx`): open, drag, minimize/restore, focus/z-order, taskbar  
- **Mobile container** (`src/shell/mobile/AppContainerPage.tsx`): full-page apps, Home list/grid per era  
- **Swipe-to-dismiss gesture** on Now-OS mobile with scrim opacity feedback (Framer Motion)  
- **App registry stubs** (About, Projects, Gallery, Settings, Connect, Arcade, Dimension, Terminal)  
- **EraProvider** (`src/shell/era/EraContext.tsx`): schedule polling, countdown tick, body theme class, `VITE_FORCE_ERA` override  
- **CountdownBadge** (`src/components/CountdownBadge.tsx`): shows next era, refreshable  
- **RebootOverlay** (`src/shell/RebootOverlay.tsx`): brief fade/message on era flip, reduced-motion friendly  
- Initial Vite + React + TS scaffold (index.html, vite, tsconfig, Tailwind)  
- Repo hygiene files: editorconfig, prettierrc, nvmrc, LICENSE, CONTRIBUTING, env.example, gitignore updates  
- PR template + CI  

### Fixed
- Completed `appRegistry` scaffold (missing app stubs, unfinished export)  
- Typo in app registry exports causing HMR warnings  
- Fix: Wire Settings.EXE barrel and registry import; ensure openApp('settings') mounts the app (debug log added).

### Changed
- Updated global styles (`src/styles/index.css`) with scrim, badge, and overlay tokens  
- Bound active era to body theme class (`theme-terminal`, `theme-os91`, `theme-now`)  
- README, easy docs, and daily logs updated with era schedule + override instructions  