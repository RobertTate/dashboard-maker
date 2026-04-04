# Dashboard Maker

## Maintaining These Context Files

When making changes that affect the architecture, data flow, component tree, hook responsibilities, or key patterns described in this file or `src/CLAUDE.md`, update the relevant sections in this file to stay accurate. This includes adding/removing/renaming components, hooks, DB keys, OBR broadcast channels, or plugins.

## What This Is

An [Owlbear Rodeo](https://www.owlbear.rodeo/) extension for TTRPG players and GMs to keep game content (notes, character sheets, initiative trackers, etc.) accessible during play. Built with React + TypeScript + Vite. Deployed on Vercel.

The app also runs in a **standalone mode** (outside Owlbear Rodeo) for demo purposes, but it is first and foremost an OBR extension. Any OBR SDK features (sharing dashboards, broadcasting dice rolls, dashboard search via tokens) are unavailable in standalone mode.

**Live standalone app:** https://owlbear-dashboard-maker.vercel.app/
**OBR Extension manifest:** `public/manifest.json` (popover action, 631x650)

## Commands

- `npm run dev` - Start Vite dev server
- `npm run dev:live` - Dev server exposed on LAN (`--host 0.0.0.0`)
- `npm run build` - TypeScript check + Vite production build
- `npm run lint` - ESLint (zero warnings allowed)
- `npm run format:css` - Prettier + Stylelint for CSS files
- `npm run format:all` - Prettier for everything

There is no test suite currently.

## Deployment

Vercel auto-deploys `main`. The standard workflow is:
1. Create a feature branch
2. Push it to create a PR + Vercel preview environment
3. Merge the PR when ready (this deploys to production)

Avoid pushing directly to `main`.

## Architecture Overview

### Entry Point & Providers

`main.tsx` sets up React, reads persisted theme/mode from the DB, and wraps the app in `AppProvider` (simple context for `selectedDashboard` state). `App.tsx` initializes the OBR SDK, determines the player's role (GM/PLAYER), and renders `PopOver`.

### Two-Screen Layout

- **Home screen** (`PopOver`): Dashboard list with folder organization, create/upload controls, premade dashboards
- **Dashboard view** (`Dashboard` + `SyncingGrid`): A responsive grid of draggable/resizable `Widget` components, each containing an MDXEditor instance

Navigation between screens is driven by `selectedDashboard` in AppContext (empty string = home screen).

### Data Storage

All data lives in **IndexedDB via localforage** (`src/dbInstance.ts`). Each dashboard is stored as a `DashboardItemsProps` object keyed by its name.

**Reserved DB keys** (not dashboards, used for app state):
- `Menu_Object` - Folder structure and layout state
- `Dash_Mode_String` - Light/dark mode preference
- `Dash_Theme_String` - Color theme preference

These reserved names are checked in `createADashboard` to prevent collisions.

### Key Subsystems

- **Folder system** (`src/functions/folderFunctions.ts`): Nested folder structure stored in `MenuObject`. `currentFolder` is a path array used to traverse the tree. The home screen grid is also a `react-grid-layout` instance, so folders/dashboards are draggable.
- **Dice rolling** (`src/functions/hooks/useDice.ts`): Uses `@3d-dice/dice-box` for 3D rendering. Dice notation (e.g. "1d6+3") is detected via a custom MDXEditor markdown shortcut plugin (`src/plugins/`) and rendered as clickable `<span data-dice-notation="...">` elements. Click handlers are attached at the document level.
- **Dashboard sharing** (`Dashboard.tsx`): GM can broadcast a compressed (pako gzip + base64) dashboard to all players via `OBR.broadcast`. Players receive it in `useReceiveDashboard`.
- **Dice roll sharing**: GM can optionally share rolls; player rolls are shared automatically. Uses `OBR.broadcast` with channel `com.roberttate.dashboard-maker-dice-notification`.
- **Dashboard search** (`useDashboardSearch`): Lets OBR tokens open a dashboard by matching the token name to a dashboard name (exact match required).
- **Premades** (`src/partials/`, `src/functions/premadesFunctions.ts`): Pre-built D&D 5e reference dashboards, lazily imported and auto-added to a "Premades > 5th Edition D&D" folder on init.

### Widget / Editor Stack

Each widget uses `@mdxeditor/editor` (MDXEditor) with plugins for headings, lists, quotes, images, tables, links, thematic breaks, admonitions, and the custom dice notation directive. The toolbar is rendered into a shared `#toolbar` div. Content updates are debounced (500ms) via lodash.debounce.

### Styling

- CSS Modules for component-specific styles (`src/styles/*.module.css`)
- Global styles in `src/index.css`
- Theming via CSS custom properties in `src/styles/theme.css`, switched by `data-theme` and `data-mode` attributes on `<html>`
- SVGs imported as React components via `vite-plugin-svgr` (`*.svg?react`)

## Gotchas

- The `@3d-dice` packages lack TypeScript types. Imports use `@ts-expect-error` suppression. This is a known limitation of those libraries.
- Dashboard names must be unique across the entire DB (they're used as storage keys).
- The `SyncingGrid` uses a `syncStorage` counter pattern - incrementing it triggers a `useEffect` that persists the current layout + widgets to localforage. This is the primary save mechanism.
- `react-grid-layout` layouts are compared with `lodash.isequal` to avoid unnecessary re-renders and save cycles.
- The `cancelDrag` CSS class is used on elements inside grid items that should not trigger drag behavior (editor content, toolbar, delete buttons).
