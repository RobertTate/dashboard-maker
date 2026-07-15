# Code Cleanup Development Plan

**Branch:** `feature/code-cleanup`
**Started:** 2026-07-15

## Purpose

This document tracks a code-quality cleanup pass on Dashboard Maker. It exists so
that any development session (human or agent, including a fresh session with no
prior context) can pick up exactly where the last one left off. Read this file
plus `CLAUDE.md` and `src/CLAUDE.md` before continuing the work.

## Goals

1. Get `npm run lint` passing again (it currently fails on one warning that is
   also a real bug).
2. Establish a test suite (vitest) covering the pure logic in `src/functions/`
   before doing any structural refactoring.
3. Remove duplication and fragile patterns identified in the 2026-07-15
   codebase assessment, so future feature work is safer and easier.

## Ground Rules

- **One task = one commit.** Each task below gets its own commit on this branch.
- The checkbox + progress log update for a task is included in that task's commit.
- `npm run lint` and `npm run build` must pass before every commit (and
  `npm run test` once it exists, from Task 3 onward).
- No behavior changes except where a task explicitly says it fixes a bug.
- Update `CLAUDE.md` / `src/CLAUDE.md` in the same commit when a task changes
  anything they describe (commands, hooks, patterns, file layout).
- Merge to `main` via PR when the branch is done (Vercel auto-deploys `main`).

## Tasks

### ✅ = done, each with its commit hash once complete

- [ ] **Task 1 — Fix stale tooltip memo bug.**
  `renderTooltip` in `src/components/SyncingGrid.tsx` omits `widgetId` and
  `tooltipId` from its `useMemo` deps. Clicking tooltip B while/after tooltip A
  was open can show stale content. Add the deps. This also clears the only
  ESLint warning, making `npm run lint` green again.

- [ ] **Task 2 — Remove accidental dependencies.**
  `install` and `npm` in `package.json` `dependencies` are accidental
  (`npm install install` at some point). Uninstall both; verify build.

- [ ] **Task 3 — Add vitest + tests for pure functions.**
  Add `vitest` as a devDependency and a `test` script. Cover
  `src/functions/folderFunctions.ts` (folder traversal, recursive dashboard
  search, folder import with name-collision renaming — mock `dbInstance`),
  `src/functions/generateLayouts.ts`, and `src/functions/validateUpload.ts`.
  Update `CLAUDE.md` ("There is no test suite currently" becomes the test
  command).

- [ ] **Task 4 — Extract shared compress/decompress utils.**
  The gzip+base64 encode in `DashboardMenu.tsx` (`handleShare`) and decode in
  `useReceiveDashboard.ts` are inverse copies. Extract to
  `src/functions/compression.ts` (`compressToB64String` /
  `decompressFromB64String`), use in both, add tests (round-trip).

- [ ] **Task 5 — Centralize reserved DB keys.**
  `Menu_Object`, `Dash_Mode_String`, `Dash_Theme_String` are string literals in
  `PopOver.tsx` (createADashboard collision check) and `DashboardFileSystem.tsx`
  (filter, which currently only excludes `Menu_Object`). Export a
  `RESERVED_DB_KEYS` constant from `src/constants/` and use it in both places;
  the file-system filter should exclude all three.

- [ ] **Task 6 — Dedupe startingMenu in useInitDashboards.**
  `src/functions/hooks/useInitDashboards.ts` has an identical `startingMenu`
  construction block copy-pasted in two branches. Extract to one helper.

- [ ] **Task 7 — Dedupe useDice broadcast branches.**
  The GM and player branches in `src/functions/hooks/useDice.ts`
  (`onRollComplete`) contain an identical "broadcast roll result" block.
  Extract a shared `broadcastRollResult` helper; GM keeps the share button,
  players auto-share.

- [ ] **Task 8 — Refactor DashboardFileSystem event wiring.**
  The riskiest task; do last, in isolation.
  Current problems in `src/components/DashboardFileSystem.tsx` +
  `src/functions/hooks/useCreateMenuItems.tsx`:
  - Folder/up-button clicks are wired via `document.querySelectorAll` +
    native listeners in effects instead of React handlers.
  - Drag targets are identified by `element.textContent`, which breaks when
    names render truncated (SVG `textLength` path) and is fragile generally.
  - Grid items use incrementing array indices as React keys.
  Changes: use folder/dashboard **names** as keys and read identity from
  `data-*` attributes (`data-dash`, `data-folder`, already half in place),
  never `textContent`; replace the querySelector effects with React `onClick`
  handlers (a plain click still needs to be distinguished from a drag via the
  existing `isDragging` threshold logic). Verify by running the app: enter/exit
  folders, drag dash into folder, drag dash up a level, reorder items, and
  confirm layouts persist after refresh.

### Stretch (not committed to)

- [ ] Consolidate `radix-ui` vs `@radix-ui/react-dropdown-menu` (two versions
  of the same library family).
- [ ] `createADashboard(name, template)` signature cleanup — decouple data
  logic from input-ref/`setCustomValidity` UI (see assessment; only worth it
  when a third creation path appears).

## Context: Findings from the 2026-07-15 Assessment (for fresh sessions)

- Build passes; lint fails only on the Task 1 warning.
- The codebase is otherwise healthy: accurate CLAUDE.md docs, centralized
  types (`src/types/index.ts`), consistent `memo` + `syncStorage`-counter
  patterns, small focused hooks.
- Deliberately **not** doing: code-splitting the 1.5MB main chunk (popover
  loads once; not worth complexity), replacing the `syncStorage` counter
  pattern (unusual but consistent and documented), removing `@ts-expect-error`
  on `@3d-dice` imports (upstream has no types), or touching the direct
  `element.style` mutations used for drag feedback.

## Progress Log

- **2026-07-15** — Assessment completed; branch `feature/code-cleanup` created;
  this plan written.
