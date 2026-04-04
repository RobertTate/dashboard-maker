# src/ Architecture Guide

## Component Tree

```
main.tsx
└── AppProvider (context: selectedDashboard)
    └── App (OBR init, role detection, global hooks)
        └── PopOver (home screen OR dashboard view)
            ├── [Home] DashboardFileSystem, FolderCreator, InfoMenu
            └── [Dashboard] Dashboard
                └── SyncingGrid (react-grid-layout)
                    └── Widget (MDXEditor instance per grid item)
                        └── CustomToolbar, CustomLinkDialog
```

## Directory Layout

- `components/` - React components (one per file, all use `memo`)
- `functions/` - Pure utility functions (folder traversal, layout generation, validation, collision detection)
- `functions/hooks/` - Custom React hooks (data init, OBR communication, dice, storage sync)
- `plugins/` - MDXEditor plugins for dice notation (directive descriptor + markdown shortcut)
- `partials/` - Static dashboard content (premade D&D 5e reference sheets, starting layouts, character template)
- `types/` - TypeScript type definitions
- `styles/` - CSS Modules + global theme
- `assets/` - SVG icons (imported as React components via `?react` suffix)

## Data Flow

1. **Init**: `useInitDashboards` loads all keys from localforage, adds any missing premades, and builds the `MenuObject` (folder tree + layouts)
2. **Navigation**: Setting `selectedDashboard` (via `AppContext`) switches between home and dashboard view
3. **Dashboard load**: `SyncingGrid` reads the dashboard's `DashboardItemsProps` from localforage on mount
4. **Editing**: Widget content changes are debounced (500ms), then `SyncingGrid` persists the full dashboard state back to localforage
5. **Folder sync**: `useSyncStorage` persists the `MenuObject` to localforage whenever the folder structure or layouts change

## Hook Responsibilities

| Hook | Purpose |
|------|---------|
| `useAppStore` | Access `AppContext` (selectedDashboard + selectADashboard) |
| `useInitDashboards` | Load dashboard list + folder structure from DB on mount/refresh |
| `useSyncStorage` | Persist `MenuObject` to localforage |
| `useDice` | Initialize dice-box canvas, attach click/touch handlers, handle roll results + broadcasting |
| `useShowDiceResults` | Listen for incoming shared dice roll broadcasts (OBR) |
| `useReceiveDashboard` | Listen for incoming shared dashboard broadcasts (OBR) |
| `useDashboardSearch` | Register OBR context menu item to search dashboards by token name |
| `useCreateMenuItems` | Build OBR context menu actions |
| `useFixLayout` | Repair/migrate layout data if needed |

## Key Types

- `DashboardItemsProps` - Core dashboard data: `{ layouts, widgets, isLocked, columns }`
- `WidgetProps` - Single widget: `{ id, content, alignment? }`
- `MenuObject` - Folder tree root: `{ layouts?, folders, dashboards, currentFolder }`
- `Folder` - Nested folder node: `{ dashboards?, folders?, layouts? }`
- `Role` - `"GM" | "PLAYER" | undefined`

## Patterns

- **Components are wrapped in `memo`** with explicit `displayName` assignment
- **State sync via counter**: Both `SyncingGrid` and `PopOver` use a `syncStorage` counter - incrementing it triggers persistence via `useEffect`
- **SVG icons**: Imported with `?react` suffix (vite-plugin-svgr), rendered as React components with `className="icon-svg-*"` conventions
- **OBR broadcast channels**: `com.roberttate.dashboard-maker` (dashboard sharing), `com.roberttate.dashboard-maker-dice-notification` (dice rolls)
