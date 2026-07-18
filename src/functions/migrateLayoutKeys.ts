import { RESERVED_DB_KEYS } from "../constants/dbKeys";
import { generateLayouts } from "./generateLayouts";
import type { Folder, MenuObject } from "../types";

export const MOVE_UP_BUTTON_KEY = "MoveDashUpButton";

const numericPattern = /^\d+$/;

/**
 * The render order the legacy index keys were matched against:
 * [up-button (non-root only), ...folders, ...dashboards in db-key order].
 * Dashboards render in db-key order (via dashBoardsArray), NOT in
 * folder-array order — see DashboardFileSystem's filteredDashboards.
 */
const orderedNamesFor = (
  node: Folder | MenuObject,
  dbKeys: string[],
  isRoot: boolean,
): string[] => {
  const folderNames = Object.keys(node.folders ?? {});
  const dashNames = dbKeys.filter(
    (key) =>
      !RESERVED_DB_KEYS.includes(key) && node.dashboards?.includes(key),
  );
  return [
    ...(isRoot ? [] : [MOVE_UP_BUTTON_KEY]),
    ...folderNames,
    ...dashNames,
  ];
};

/**
 * True when every item name has a layout entry in every breakpoint —
 * i.e. react-grid-layout would never need to auto-place a tile.
 */
const layoutsCoverAllNames = (
  layouts: ReactGridLayout.Layouts,
  orderedNames: string[],
) => {
  return Object.values(layouts).every((entries) => {
    const ids = new Set(entries.map((entry) => entry.i));
    return orderedNames.every((name) => ids.has(name));
  });
};

const remapNodeLayouts = (
  node: Folder | MenuObject,
  orderedNames: string[],
) => {
  if (!node.layouts) return;
  const allEntries = Object.values(node.layouts).flat();
  if (allEntries.length === 0) return;

  // Already name-keyed: never touch it again. Partial coverage here is
  // normal incremental state (e.g. a dashboard dragged into a closed
  // folder) — react-grid-layout auto-places just the new tile when that
  // folder next renders, preserving the rest of the arrangement.
  const isLegacyIndexKeyed = allEntries.every((entry) =>
    numericPattern.test(entry.i),
  );
  if (!isLegacyIndexKeyed) return;

  // An index remap is ambiguous if any item is itself named like an
  // integer; fall straight through to the clean fill order.
  const anyNameLooksNumeric = orderedNames.some((name) =>
    numericPattern.test(name),
  );
  if (!anyNameLooksNumeric) {
    const newLayouts: ReactGridLayout.Layouts = {};
    for (const [breakpoint, entries] of Object.entries(node.layouts)) {
      newLayouts[breakpoint] = entries.flatMap((entry) => {
        const name = orderedNames[parseInt(entry.i, 10)];
        return name ? [{ ...entry, i: name }] : [];
      });
    }
    node.layouts = newLayouts;
  }

  // Migration endpoint: either the remap faithfully covers every tile, or
  // the folder gets the clean fill order (same as the refresh button) —
  // never a partial remap where uncovered tiles auto-stack into the first
  // column. Handles legacy data that had drifted out of sync with folder
  // contents under the old index-matching scheme.
  if (
    anyNameLooksNumeric ||
    !layoutsCoverAllNames(node.layouts, orderedNames)
  ) {
    node.layouts = generateLayouts(orderedNames);
  }
};

/**
 * In-place migration of persisted Menu_Object layouts from legacy index ids
 * ("0", "1", ...) to item-name ids. Executes on every app load but is only
 * *effective* once per folder: name-keyed layouts hit an early return, so
 * repeated runs (StrictMode, multi-tab, every future session) are no-ops.
 */
export const migrateLayoutKeys = (
  menuObject: MenuObject,
  dbKeys: string[],
): MenuObject => {
  const walk = (node: Folder | MenuObject, isRoot: boolean) => {
    remapNodeLayouts(node, orderedNamesFor(node, dbKeys, isRoot));
    for (const child of Object.values(node.folders ?? {})) {
      walk(child, false);
    }
  };
  walk(menuObject, true);
  return menuObject;
};
