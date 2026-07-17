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
        if (keys.includes(MENU_OBJECT_KEY)) {
          const storedMenu = (await db.getItem(MENU_OBJECT_KEY)) as MenuObject;
          if (storedMenu.folders) {
            applyPremades(storedMenu, premades);
            setMenuObject(storedMenu);
          } else {
            const startingMenuLayouts = generateLayouts([...keys, "Premades"]);
            const startingMenu: MenuObject = {
              layouts: startingMenuLayouts,
              currentFolder: [],
              folders: {
                Premades: {
                  folders: {
                    "5th Edition D&D": {
                      dashboards: [...keys.filter((key) => key.includes("⭐"))],
                    },
                  },
                },
              },
              dashboards: [...keys.filter((key) => !key.includes("⭐"))],
            };

            setMenuObject(startingMenu);
          }
        } else {
          const startingMenuLayouts = generateLayouts([...keys, "Premades"]);
          const startingMenu: MenuObject = {
            layouts: startingMenuLayouts,
            currentFolder: [],
            folders: {
              Premades: {
                folders: {
                  "5th Edition D&D": {
                    dashboards: [...keys.filter((key) => key.includes("⭐"))],
                  },
                },
              },
            },
            dashboards: [...keys.filter((key) => !key.includes("⭐"))],
          };

          setMenuObject(startingMenu);
        }
      }
    };
    initDashboards();
  }, [refreshCount, setDashboardsArray, setMenuObject]);
};
