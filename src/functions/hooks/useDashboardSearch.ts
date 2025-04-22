import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { useEffect } from "react";

import { useAppStore } from "./useAppStore";
import db from "../../dbInstance";

export const useDashboardSearch = () => {
  const { selectedDashboard, selectADashboard } = useAppStore();

  useEffect(() => {
    const setupContextMenu = () => {
      OBR.contextMenu.create({
        id: `com.roberttate.dashboard-maker-search-context-menu`,
        icons: [
          {
            icon: "/icon.svg",
            label: "Dashboard Search",
            filter: {
              every: [{ key: "type", value: "IMAGE" }],
            },
          },
        ],
        onClick: async (context) => {
          if (isImage(context?.items?.[0])) {
            const imageItem = context?.items?.[0];
            const givenTokenName = imageItem?.text?.plainText || "";
            const keys = await db.keys();
            if (givenTokenName === "") {
              await OBR.player.deselect();
              await OBR.notification.show(
                `No Dashboard found. Token must have a name to match a dashboard!`,
                "ERROR",
              );
            } else if (givenTokenName === selectedDashboard) {
              await OBR.player.deselect();
              await OBR.notification.show(
                `That dashboard is already open!`,
                "SUCCESS",
              );
            } else if (keys.includes(givenTokenName)) {
              await OBR.player.deselect();
              selectADashboard(givenTokenName);
              await OBR.action.open();
            } else {
              await OBR.player.deselect();
              await OBR.notification.show(
                `No Dashboard found by that name.`,
                "ERROR",
              );
            }
          } else {
            await OBR.player.deselect();
            await OBR.notification.show(
              `That token type doesn't work for dashboard searching. Sorry!`,
              "ERROR",
            );
          }
        },
      });
    };

    OBR.onReady(() => {
      setupContextMenu();
    });
  }, [selectedDashboard, selectADashboard]);
};
