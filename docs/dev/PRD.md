# Product Requirements Document (PRD) — website-os

## Vision
A living, retro-futurist portfolio that evolves in **three eras** while keeping the same content/apps. The **shell** (UI chrome, layout metaphor, motion/sound) deepens each era. A public **countdown** flips the active era via a **reboot animation**.

## Eras (UI/UX)
- **Terminal-OS (current)**
  - Look: CRT/monospace, one large terminal window; minimal desktop.
  - Mobile: **list-style home**; apps open full-page.
  - Purpose: Strong identity; simplest baseline.

- **OS-91**
  - Look: Krazam/Win95-style; **icon grid + taskbar**; draggable windows.
  - Mobile: **grid home**; apps open full-page; top bar replaces taskbar.
  - New: Live wallpaper option for Dimension; lobby basics in Connect.

- **Now-OS**
  - Look: modern, polished; **dock/panel + launcher (⌘K)**; widgets.
  - Mobile: grid home + **dock + search**; full-page apps.
  - New: Profiles in Connect; ranked/leaderboards in Arcade; Dimension full-bleed + avatars.

**References:** Krazam (OS-91), ProzillaOS / OS.js / Dustin Brett (Now-OS).

## Information Architecture (Apps)
- **About.EXE**, **Projects.EXE**, **Gallery.EXE**, **Terminal.EXE**, **Settings.EXE**
- **Connect.EXE** (social layer: presence, invites, chat, profiles later)
- **Arcade.EXE** (Pong, Snake, **Tron 4-player** later; local + online)
- **Dimension.EXE** (3D playground → wallpaper → shared space)
- **Terminal.EXE**  
  - Currently implemented as a **Toy Shell**: fun, retro terminal that can launch apps via commands (e.g., `open about`).  
  - Apps are also accessible via desktop icons/launcher.  
  - Future option (Sprint 3): promote to **Primary Shell** where all navigation is command-driven. See ADR-001.

## Mobile Behaviors
- Terminal-OS: home=list
- OS-91 & Now-OS: home=grid (+dock/search in Now-OS)
- All mobile apps open **full-page** with back/gesture; desktop uses **windows**.

## Era Layout Profiles (contract)
```ts
type EraLayoutProfile = {
  desktop: { homeMode: 'none'|'icons'; windowMode: 'window'|'max'; launcher?: boolean };
  mobile:  { homeMode: 'list'|'grid';  windowMode: 'page-full'; dock?: boolean; search?: boolean };
};
```

## Folder Layout (high-level)
```text
apps/{about,projects,gallery,settings,connect,arcade,dimension}
arcade/{core,games/{pong,snake,tron},renderers/{terminal,os91,now},net/{local,colyseus}}
shell/{windowing,taskbar,launcher,app-registry,chrome}
themes/{terminal-os,os-91,now-os}
services/{auth,realtime,db}
content/{projects.json,media.json,lore.json}
docs/{dev,easy,decisions,log}
```

## Countdown & Era Flip
- Client loads a JSON schedule from `VITE_ERA_SCHEDULE_URL`.
- Shows a countdown badge; at zero triggers a **Reboot overlay** → switches active era without redeploy.

### Era binding (shell)
- A provider computes the active era from the schedule or `VITE_FORCE_ERA` (dev override).
- On era change, set `document.body.dataset.era` and toggle a theme class among `theme-terminal`, `theme-os91`, `theme-now`.
- Shell picks layout from `layoutProfiles` keyed by `'terminal-os' | 'os-91' | 'now-os'`.

---

## Connect.EXE Roadmap
- **v1 (Terminal):** anon identity, presence, invites, global/room chat.
- **v2 (OS-91):** friends list, DMs, room browser integration.
- **v3 (Now-OS):** profiles (username/avatar), richer notifications, desktop widgets, Dimension avatars.

---

## Arcade.EXE Roadmap
- **v1 (Terminal):** Pong + Snake (local + simple online), ASCII/retro renderer.
- **v2 (OS-91):** Tron 4-player, lobby browser, spectators, pixel renderer.
- **v3 (Now-OS):** ranked, leaderboards, polished visuals, animations.

---

## Dimension.EXE Roadmap
- **v1 (Terminal):** CRT-styled window, simple commands/FX, low-fi shaders.
- **v2 (OS-91):** “Set as Wallpaper”, UI sliders; moderate post-FX.
- **v3 (Now-OS):** full-bleed, modern post-processing, avatars (via Connect), embedded Arcade panels possible.

---

## Architecture & Stack
- React 18 + Vite 5 + TypeScript
- Styling via **CSS variables/Tailwind tokens** (no raw hex in components)
- Games: deterministic TS logic; renderers per era
- **Colyseus** authoritative server (30Hz) + local fallback
- **Supabase** (auth/DB/realtime/storage) for presence, chat, scores
- Static content in repo JSON (`content/*.json`), media in object storage
- Accessibility: keyboard nav, focus states, `prefers-reduced-motion`
- Bugs: maintain root `BUGS.md`, update on discovery/fix with ID, steps, fix commit.

---

## Sprint 1 — Acceptance
- `layoutProfiles` exist; desktop/mobile behavior per era works (Terminal mobile=list; OS-91/Now=grid).
- Countdown reads schedule (env `VITE_ERA_SCHEDULE_URL`) and exposes `onEraFlip`.
- WindowManager MVP (desktop) + AppContainerPage (mobile).
- AppRegistry opens stubs for all apps.
- Docs updated: README, CHANGELOG, dev/easy docs, daily log, BUGS.md if relevant.

### Sprint 1 — Chunk 3: Window Manager MVP
Requirements
- Desktop can open, move, minimize, and restore windows.
- Focus management and z-order: last interacted window is on top.
- Simple taskbar shows running apps; click to focus/restore, double-click to minimize.
- Keyboard accessibility: focus ring, Arrow keys nudge when title is focused; Escape minimizes.
- Respect `prefers-reduced-motion` for any animations (none added yet).

Implementation Notes
- Deterministic TS state in `src/shell/windowing/WindowManager.tsx`. No DOM mutations outside React.
- Drag is implemented via mouse listeners; resizing is deferred.
- Mobile remains full-page per era layout profile; no windowing there.