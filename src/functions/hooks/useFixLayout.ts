import { useEffect } from "react";

import { generateLayouts, getCurrentFolder } from "../";
import type { Folder, MenuObject } from "../../types";

/**
 * Fixes an intermittent issue with react-grid-layout, where layouts sometimes don't set correctly on page load.
 */
export const useFixLayout = (
  currentFolderObject: Folder,
  setMenuObject: (value: React.SetStateAction<MenuObject>) => void,
) => {
  useEffect(() => {
    if (
      currentFolderObject.layouts &&
      Object.keys(currentFolderObject.layouts || {}).length !== 5
    ) {
      setMenuObject((prevMenuObj) => {
        const newMenuObj: MenuObject = structuredClone(prevMenuObj);
        const currentFolder = getCurrentFolder(newMenuObj);
        const goUpButton = [];
        if (newMenuObj.currentFolder.length !== 0) {
          goUpButton.push("MoveDashUpButton");
        }
        currentFolder.layouts = generateLayouts([
          ...goUpButton,
          ...Object.keys(currentFolder.folders || {}),
          ...(currentFolder.dashboards || []),
        ]);
        return newMenuObj;
      });
    }
  }, [currentFolderObject.layouts, setMenuObject]);
};
