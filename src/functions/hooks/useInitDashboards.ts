import { useEffect } from "react";

import {
  applyPremades,
  checkAndAddPremades,
  generateLayouts,
  getCurrentFolder,
  migrateLayoutKeys,
  sortDashboards,
} from "../";
import {
  MENU_OBJECT_KEY,
  RESERVED_DB_KEYS,
  SORT_ORDER_KEY,
} from "../../constants/dbKeys";
import {
  DEFAULT_SORT_ORDER,
  type SortOrder,
} from "../../constants/sortOptions";
import db from "../../dbInstance";
import type { MenuObject } from "../../types";

const buildStartingMenu = (keys: string[]): MenuObject => ({
  // Layout order mirrors render order: folders first, then dashboards
  // (reserved app-state keys and premades never render at the root).
  layouts: generateLayouts([
    "Premades",
    ...keys.filter(
      (key) => !key.includes("⭐") && !RESERVED_DB_KEYS.includes(key),
    ),
  ]),
  currentFolder: [],
  folders: {
    Premades: {
      folders: {
        "5th Edition D&D": {
          dashboards: keys.filter((key) => key.includes("⭐")),
        },
      },
    },
  },
  dashboards: keys.filter((key) => !key.includes("⭐")),
});

export const useInitDashboards = (
  refreshCount: number,
  setDashboardsArray: React.Dispatch<React.SetStateAction<string[]>>,
  setMenuObject: React.Dispatch<React.SetStateAction<MenuObject>>,
) => {
  useEffect(() => {
    const initDashboards = async () => {
      let keys = await db.keys();
      const premades = await checkAndAddPremades(keys);
      if (premades.length > 0) {
        keys = [...keys, ...premades];
      }
      setDashboardsArray(keys);

      if (refreshCount > 0) {
        const sortOrder =
          ((await db.getItem(SORT_ORDER_KEY)) as SortOrder | null) ??
          DEFAULT_SORT_ORDER;
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = structuredClone(prevMenuObj);
          const isTopLevel = newMenuObj?.currentFolder?.length === 0;
          if (!newMenuObj.folders) {
            newMenuObj.folders = {};
          }
          applyPremades(newMenuObj, premades);
          const currentFolder = getCurrentFolder(newMenuObj);
          // Folders keep their stored order; only dashboards are sorted.
          const layoutsArray = [
            ...(Object.keys(currentFolder.folders || {}) || []),
            ...sortDashboards(currentFolder.dashboards || [], sortOrder),
          ];
          if (!isTopLevel) {
            layoutsArray.unshift("MoveDashUpButton");
          }
          currentFolder.layouts = generateLayouts(layoutsArray);
          return newMenuObj;
        });
      } else {
        const storedMenu = keys.includes(MENU_OBJECT_KEY)
          ? ((await db.getItem(MENU_OBJECT_KEY)) as MenuObject)
          : null;
        if (storedMenu?.folders) {
          applyPremades(storedMenu, premades);
          migrateLayoutKeys(storedMenu, keys);
          setMenuObject(storedMenu);
        } else {
          setMenuObject(buildStartingMenu(keys));
        }
      }
    };
    initDashboards();
  }, [refreshCount, setDashboardsArray, setMenuObject]);
};
