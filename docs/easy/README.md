# Easy-Docs (Plain English)

**What is this?**  
A website that looks and behaves like an operating system. It changes “eras” over time:
- **Terminal-OS** → big retro terminal window
- **OS-91** → classic desktop with icons
- **Now-OS** → modern desktop with a dock and search

**Mobile:**  
- Terminal shows a simple **list** of apps.  
- OS-91 and Now-OS show **icon grids**.  
Tapping an app opens it **full-screen**.

**Apps:**  
- **Connect** lets you see friends, chat, and invite them to play.  
- **Arcade** has mini games (Pong, Snake, Tron).  
- **Dimension** is a 3D space that grows from a fun window → live wallpaper → shared multiplayer room.

**Countdown:**  
There’s a timer on the site. When it hits zero, the OS “reboots” into the next era.

## What works now (Sprint 1)
- The site knows which era is active based on a public schedule file.
- A small timer badge counts down to the next era flip.
- On desktop, you can open app windows, drag them, use arrow keys to nudge, minimize to the taskbar, and restore them. The active window comes to the front.
- On mobile, the home screen shows a list (Terminal-OS) or grid (OS-91/Now-OS) of apps. Tapping opens the app full-screen.
 - New: Desktop vs Mobile render differently via a layout profile. Desktop shows a big placeholder shell; Mobile shows a simple list or grid based on the active era.

## New in Chunk 2
## New in Chunk 3
- Desktop has a basic Window Manager: open/move/minimize/restore and a simple taskbar.
- Keyboard: use Arrow keys when the window title is focused to nudge the window; Escape to minimize.
- There’s now a visible countdown (days:hours:minutes:seconds).
- When the timer hits zero, a short “Rebooting…” overlay appears and then the OS switches to the next era.
- Colors and fonts change automatically because themes are controlled by CSS variables for each era.

## Era
- The site picks an “era” from a schedule file.
- Developers can force an era locally using a `.env.local` setting: `VITE_FORCE_ERA=terminal-os` (or `os-91`, `now-os`).
- You’ll see a tiny badge in the corner in dev showing the current era.

## Dev override & countdown
- Want to preview a specific era? Create `.env.local` at the project root with `VITE_FORCE_ERA=now-os` to lock the UI to Now-OS during development.
- The site shows a persistent countdown badge that reads the schedule and displays time remaining to the next era. Click the badge to refresh the schedule from the server.

## Recents & File Browser
- The site includes minimal **Recents.EXE** and **File Browser.EXE** apps in `src/apps/recents` and `src/apps/filebrowser`.
- **Recents.EXE**: shows apps/files you've opened recently (stored in localStorage).
- **File Browser.EXE**: browse the stub virtual file system (stubbed data in `src/services/fileSystem.ts`).