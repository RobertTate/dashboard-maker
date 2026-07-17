import OBR from "@owlbear-rodeo/sdk";
import { useEffect } from "react";

import db from "../../dbInstance";
import type { SharedDashboard } from "../../types";
import type { MenuObject } from "../../types";
import { decompressFromB64String } from "../compression";
import {
  findAllDashboardsWithinCurrentFolderStruc,
  getCurrentFolder,
} from "../folderFunctions";

export const useReceiveDashboard = (
  standalone: boolean,
  setRefreshCount: React.Dispatch<React.SetStateAction<number>>,
  selectADashboard: (dashName: string) => void,
  setMenuObject: React.Dispatch<React.SetStateAction<MenuObject>>,
) => {
  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker",
        async (event) => {
          try {
            const sharedDashboard = decompressFromB64String<SharedDashboard>(
              event?.data as string,
            );
            const { sharedDashboardTitle, sharedDashboardContent, target } =
              sharedDashboard;

            if (target && target !== "ALL") {
              const myConnectionId = await OBR.player.getConnectionId();
              if (target !== myConnectionId) return;
            }

            await db.setItem(sharedDashboardTitle, sharedDashboardContent);
            setRefreshCount((prev) => prev + 1);
            setMenuObject((prevMenuObj) => {
              const newMenuObj: MenuObject = structuredClone(prevMenuObj);
              const allDashboardsInThefolderSystem =
                findAllDashboardsWithinCurrentFolderStruc(newMenuObj);
              if (
                !allDashboardsInThefolderSystem.includes(sharedDashboardTitle)
              ) {
                const currentFolder = getCurrentFolder(newMenuObj);
                if (!currentFolder?.dashboards) {
                  currentFolder.dashboards = [];
                }
                currentFolder.dashboards.push(sharedDashboardTitle);
                return newMenuObj;
              }
              return prevMenuObj;
            });
            selectADashboard("");
            await OBR.notification.show(
              `"${sharedDashboardTitle}" has just been shared with you!`,
              "SUCCESS",
            );
          } catch (e) {
            await OBR.notification.show("Dashboard Sharing Failed.", "ERROR");
          }
        },
      );
    }
  }, [selectADashboard, setMenuObject, setRefreshCount, standalone]);
};
