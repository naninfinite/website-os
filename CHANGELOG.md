# Changelog
All notable changes to this project will be documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- Refactored `appMeta` exports into dedicated `meta.ts` files per app  
- Updated `appRegistry` to import from `meta.ts` for type safety and to fix HMR warnings  
- **Swipe-to-dismiss gesture** for windows on mobile (`AppContainerPage`, `Home`)  
- **Unified dismissal logic** in `WindowManager` (mobile + desktop parity)  
- **Scrim opacity feedback** tied to drag progress (CSS variable + styles)  
- **Launcher/LayoutProfiles updates** to support scrim opacity transitions  

---

## [2025-08-27] Scaffold 4 Complete
### Added
- Registered all core apps in `appRegistry`:
  - About, Projects, Gallery, Settings
  - Connect, Arcade, Dimension, Terminal
- Implemented `VITE_FORCE_ERA` override for development testing  
- Verified era switching logic now surfaces in UI  
- Scaffold Chunk 1: layoutProfiles + shell baseline  
- Scaffold Chunk 2: themes + reboot/countdown logic (tokens expanded, eraThemes, RebootOverlay, real Countdown)  
- Scaffold Chunk 3: WindowManager MVP (open/move/minimize/restore, focus/z-order, taskbar)  
- Added app stubs and registry wiring for Sprint 1  
- Bind active era to body theme/layout via EraProvider; added dev-era badge  
- Initial Vite + React + TS scaffold (index.html, vite, tsconfig, Tailwind)  
- Added schedule loader + countdown hook + CountdownBadge component  
- Added layoutProfiles contract and era mappings (Terminal-OS, OS-91, Now-OS)  
- Basic test for schedule logic (getActiveEra)  
- Repo hygiene files added (editorconfig, prettierrc, nvmrc, LICENSE, CONTRIBUTING, env.example, gitignore updates)  
- Added PR template + CI  

### Fixed
- Completed `appRegistry` scaffold (missing app stubs, unfinished export)  