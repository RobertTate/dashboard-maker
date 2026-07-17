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
- **Verify before commit.** After a task's change is made, Robert reviews it and
  asks questions; nothing is committed until he gives the go-ahead.
- The checkbox + progress log update for a task is included in that task's commit.
- `npm run lint`, `npm run build`, and `npm run test` must pass before every
  commit.
- No behavior changes except where a task explicitly says it fixes a bug.
- Update `CLAUDE.md` / `src/CLAUDE.md` in the same commit when a task changes
  anything they describe (commands, hooks, patterns, file layout).
- Merge to `main` via PR when the branch is done (Vercel auto-deploys `main`).

## Tasks

### ✅ = done, each with its commit hash once complete

- [x] **Task 1 — Fix tooltip memo deps.** ✅
  `renderTooltip` in `src/components/SyncingGrid.tsx` read `widgetId` and
  `tooltipId` without listing them in its `useMemo` deps. Not a reachable bug
  today (the modal dialog + create path happen to always touch a listed dep),
  but it worked by coincidence and would surface stale-content bugs on any
  future change to how tooltips open. Added the deps — safe for a JSX-returning
  `useMemo` (no side effects; recompute frequency unchanged). Also clears the
  only ESLint warning, making `npm run lint` green again.

- [x] **Task 2 — Remove accidental dependencies + npm audit.** ✅
  `install` and `npm` in `package.json` `dependencies` were accidental
  (`npm install install` at some point). Uninstalled both; nothing in the
  codebase imported either; lint + build verified.
  Audit results (was 10 vulns: 6 high, 4 moderate → now 4 moderate):
  - **Fixed:** minimatch ReDoS (all 6 high) — exact-pinned at 9.0.3 by
    `@typescript-eslint/typescript-estree`, so `npm audit fix` was a no-op;
    fixed with a scoped `overrides` entry bumping it to ^9.0.9 (dev-only chain).
  - **Accepted, documented:** `uuid` <11.1.1 via `@owlbear-rodeo/sdk` (moderate,
    "no fix available") — advisory only affects v3/v5/v6 calls with a `buf`
    argument; verified the SDK bundle only calls `v4()` with no args. Not
    exploitable. Revisit when the SDK updates.
  - **Deferred:** js-yaml DoS via `@mdxeditor/editor` ≤4.0.3 (moderate) — no
    fix within js-yaml 4.x; the real fix is the MDXEditor 4.x major upgrade
    (see stretch tasks). Worst case is a hung tab from maliciously crafted
    YAML frontmatter in a shared dashboard.

- [x] **Task 3 — Add vitest + tests for pure functions.** ✅
  Added `vitest` (4.x) with `npm run test` / `test:watch` scripts and
  `vitest.config.ts` (node environment, `src/**/*.test.ts`). 29 tests in
  `src/functions/__tests__/` covering `folderFunctions.ts` (traversal,
  recursive search, export bundling, import with collision renaming —
  `dbInstance` mocked via `vi.mock`), `generateLayouts.ts`, and
  `validateUpload.ts`. CLAUDE.md commands + testing notes updated.
  Noted quirk (intentional, tested): renaming suffixes append to the full
  name, so a colliding "Alpha (2)" becomes "Alpha (2) (2)", not "Alpha (3)".

- [x] **Task 4 — Extract shared compress/decompress utils.** ✅
  Extracted the gzip+base64 encode (`DashboardMenu.tsx` `handleShare`) and
  decode (`useReceiveDashboard.ts`) into `src/functions/compression.ts`
  (`compressToB64String` / `decompressFromB64String`), used in both call
  sites, 4 round-trip tests added (incl. unicode + large payloads).
  The util encodes in 32k chunks rather than spreading the whole compressed
  buffer into `String.fromCharCode(...)`. NOTE: this is correctness-in-
  isolation only, NOT a reachable bug fix — the only caller feeds OBR
  broadcast, which caps payloads at ~16KB, so the compressed array is always
  ~12k elements, far below the ~64k `fromCharCode` argument limit that would
  make the old inline version throw. Kept the chunking because it costs
  nothing and the util shouldn't be able to throw on large input, but it
  changes no observable sharing behavior.
  (Possible follow-up, not done: give `handleShare` a friendly "dashboard too
  large to share" message when a payload exceeds OBR's 16KB limit — currently
  it just lands in the generic catch.)

- [x] **Task 5 — Centralize reserved DB keys.** ✅
  Added `src/constants/dbKeys.ts` exporting named keys `MENU_OBJECT_KEY`,
  `MODE_KEY`, `THEME_KEY` plus a `RESERVED_DB_KEYS` array. Replaced the string
  literals across all six call sites (`PopOver.tsx` collision check,
  `DashboardFileSystem.tsx` filter, `InfoMenu.tsx`, `main.tsx`,
  `useSyncStorage.ts`, `useInitDashboards.ts`) — turned out to be more than the
  two the plan noted. The file-system filter now excludes all three reserved
  keys via `RESERVED_DB_KEYS` (was only excluding `Menu_Object`). Behavior is
  otherwise unchanged; the literals now live in exactly one place. CLAUDE.md's
  "Reserved DB keys" note points to the constants file.
  Latent bug spotted, NOT fixed here (kept task a pure refactor — see log /
  stretch): the `createADashboard` collision check only rejects a reserved key
  when it already exists in the DB (`keys.includes(dashName)` guards it). Since
  `Dash_Mode_String` / `Dash_Theme_String` don't exist until the user sets a
  mode/theme, naming a dashboard that before then slips through.

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

- [ ] Fix the reserved-key collision check in `createADashboard`: reserved
  names should be rejected always, not only when the key already exists in the
  DB. Reorder so `RESERVED_DB_KEYS.includes(dashName)` is checked before/
  independent of `keys.includes(dashName)` (surfaced during Task 5 review).
- [ ] Friendlier share error when a dashboard exceeds OBR's ~16KB broadcast
  limit: check the encoded length in `handleShare` before broadcasting and
  show a "too large to share" message instead of the generic catch (surfaced
  during Task 4 review).
- [ ] Upgrade `@mdxeditor/editor` to 4.x (breaking change; clears the js-yaml
  audit finding and drops the deferred moderate vuln — see Task 2 notes).
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
- **2026-07-15** — Task 1 done: added `widgetId`/`tooltipId` to the
  `renderTooltip` useMemo deps in `SyncingGrid.tsx`. Lint is green again.
- **2026-07-15** — (unrelated, Robert) renamed editor toolbar portal id
  `#toolbar` → `#editor-toolbar`; CSS selector + CLAUDE.md updated to match.
- **2026-07-15** — Task 2 done: removed accidental `install` and `npm`
  packages from dependencies. Ran npm audit: fixed all 6 high (minimatch, via
  scoped override), accepted uuid (not exploitable), deferred js-yaml to the
  MDXEditor 4 stretch upgrade. 10 vulns → 4 moderate.
- **2026-07-17** — Task 3 done: vitest added, 29 tests passing over
  `src/functions/` pure logic. Groundwork done; refactor tasks are next.
- **2026-07-17** — Added husky pre-commit hook running `npm test`; verified it
  blocks commits when tests fail. (`prepare` script installs it on
  `npm install`, so it works after a fresh clone.)
- **2026-07-17** — Task 4 done: compression utils extracted + tested (33 tests
  total). Dedup + tests are the real value; the chunked encoding is
  correctness-in-isolation, not a reachable fix (OBR's ~16KB broadcast cap
  keeps payloads well under the fromCharCode limit).
