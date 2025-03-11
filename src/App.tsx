import OBR, { type Image } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import db from "./dbInstance";
import PopOver from "./components/PopOver";
import { useDice } from "./functions/hooks";
import { useAppStore } from "./AppProvider";
import { Role } from "./types";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [role, setRole] = useState<Role>(undefined);
  const { selectADashboard } = useAppStore();

  useEffect(() => {
    const initDashboardMaker = async () => {
      const roleValue = await OBR.player.getRole();
      setRole(roleValue);
      setAppIsReady(true);
    };

    // Dashboard Search
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
          const isImageItemType = context?.items?.[0]?.type === "IMAGE";
          if (isImageItemType) {
            const imageItem = context?.items?.[0] as Image;
            const givenTokenName = imageItem?.text?.plainText || "";
            const keys = await db.keys();
            if (keys.includes(givenTokenName)) {
              selectADashboard("");
              selectADashboard(givenTokenName);
              await OBR.action.open();
            } else if (givenTokenName === "") {
              await OBR.notification.show(
                `No Dashboard found. Give this token a name that matches a dashboard first!`,
                "ERROR",
              );
            } else {
              await OBR.notification.show(
                `No Dashboard found by that name.`,
                "ERROR",
              );
            }
          } else {
            await OBR.notification.show(
              `That token type doesn't work for dashboard searching. Sorry!`,
              "ERROR",
            );
          }
        },
      });
    };

    OBR.onReady(() => {
      initDashboardMaker();
      setupContextMenu();
    });
  }, []);

  useDice();

  if (appIsReady) {
    return <PopOver role={role} />;
  } else {
    return (
      <>
        {OBR.isAvailable ? (
          <h1>Loading...</h1>
        ) : (
          <div id="no-owlbear">
            <PopOver standalone={true} role={role} />
          </div>
        )}
      </>
    );
  }
}
