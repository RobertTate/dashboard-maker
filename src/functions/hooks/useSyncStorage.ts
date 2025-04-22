import { useEffect } from "react";

import db from "../../dbInstance";
import type { MenuObject } from "../../types";

export const useSyncStorage = (syncStorage: number, menuObject: MenuObject) => {
  useEffect(() => {
    const syncMenu = async () => {
      if (menuObject?.layouts) {
        await db.setItem("Menu_Object", menuObject);
      }
    };
    syncMenu();
  }, [syncStorage, menuObject]);
};
