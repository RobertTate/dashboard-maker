import type { SortOrder } from "../constants/sortOptions";

/**
 * Orders dashboard names for the refresh-button layout rebuild.
 * "insertion" preserves the stored array order (oldest to newest);
 * the comparator is case-insensitive and numeric-aware, so
 * "Session 2" sorts before "Session 10".
 */
export const sortDashboards = (
  dashboards: string[],
  sortOrder: SortOrder,
): string[] => {
  if (sortOrder === "insertion") {
    return dashboards;
  }
  return [...dashboards].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }),
  );
};
