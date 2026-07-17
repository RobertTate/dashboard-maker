import { useEffect } from "react";

import { MENU_OBJECT_KEY } from "../../constants/dbKeys";
import db from "../../dbInstance";
import type { MenuObject } from "../../types";

export const useSyncStorage = (syncStorage: number, menuObject: MenuObject) => {
  useEffect(() => {
    const syncMenu = async () => {
      if (menuObject?.layouts) {
        await db.setItem(MENU_OBJECT_KEY, menuObject);
      }
    };
    syncMenu();
  }, [syncStorage, menuObject]);
};
