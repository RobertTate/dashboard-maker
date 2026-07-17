import { useEffect } from "react";

import {
  applyPremades,
  checkAndAddPremades,
  generateLayouts,
  getCurrentFolder,
} from "../";
import { MENU_OBJECT_KEY } from "../../constants/dbKeys";
import db from "../../dbInstance";
import type { MenuObject } from "../../types";

const buildStartingMenu = (keys: string[]): MenuObject => ({
  layouts: generateLayouts([...keys, "Premades"]),
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
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = structuredClone(prevMenuObj);
          const isTopLevel = newMenuObj?.currentFolder?.length === 0;
          if (!newMenuObj.folders) {
            newMenuObj.folders = {};
          }
          applyPremades(newMenuObj, premades);
          const currentFolder = getCurrentFolder(newMenuObj);
          const layoutsArray = [
            ...(Object.keys(currentFolder.folders || {}) || []),
            ...(currentFolder.dashboards || []),
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
          setMenuObject(storedMenu);
        } else {
          setMenuObject(buildStartingMenu(keys));
        }
      }
    };
    initDashboards();
  }, [refreshCount, setDashboardsArray, setMenuObject]);
};
