# BUGS.md

> Single source of truth for known issues and fixes. Update this file whenever a bug is found or fixed.

## Legend
- **Status:** open | investigating | fixed | wontfix
- **Area:** shell/windowing | themes | apps/* | arcade/* | services/* | build | docs

---

### BUG-001 — Example: Window loses focus after resize
- **Status:** open
- **Date found:** 2025-08-26
- **Area:** shell/windowing
- **Found in:** commit `abc1234`
- **Steps to Reproduce:**
  1. Open Projects.EXE and About.EXE
  2. Resize Projects window to max, then back to small
  3. Try clicking About window
- **Expected:** About gains focus and moves to front
- **Actual:** Projects retains focus even after click
- **Notes:** Likely z-index/state desync in WindowManager
- **Owner:** unassigned
- **Fix commit:** _(pending)_
- **Tests added:** _(pending)_

---

### BUG-002 — (add next bug here)
- **Status:** open
- **Date found:** YYYY-MM-DD
- **Area:** 
- **Found in:** commit `...`
- **Steps to Reproduce:** 
- **Expected:** 
- **Actual:** 
- **Fix commit:** 
- **Tests added:** 