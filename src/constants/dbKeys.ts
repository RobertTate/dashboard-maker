/**
 * Reserved localforage keys used for app state rather than dashboards.
 * Dashboard names are used directly as DB keys, so they must never collide
 * with these (enforced in `createADashboard`).
 */
export const MENU_OBJECT_KEY = "Menu_Object";
export const MODE_KEY = "Dash_Mode_String";
export const THEME_KEY = "Dash_Theme_String";
export const LAST_SEEN_ANNOUNCEMENT_KEY = "Dash_Announcement_Seen_String";
export const SORT_ORDER_KEY = "Dash_Sort_Order_String";

export const RESERVED_DB_KEYS: readonly string[] = [
  MENU_OBJECT_KEY,
  MODE_KEY,
  THEME_KEY,
  LAST_SEEN_ANNOUNCEMENT_KEY,
  SORT_ORDER_KEY,
];
