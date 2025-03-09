import OBR from "@owlbear-rodeo/sdk";
import pako from "pako";
import { useEffect } from "react";

import db from "../../dbInstance";
import type { SharedDashboard } from "../../types";

export const useReceiveDashboard = (
  standalone: boolean,
  setRefreshCount: React.Dispatch<React.SetStateAction<number>>,
  selectADashboard: (dashName: string) => void,
) => {
  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker",
        async (event) => {
          try {
            const b64EncodedCompressedUint8ArrayString = event?.data as string;
            const compressedUint8ArrayString = atob(
              b64EncodedCompressedUint8ArrayString,
            );
            const compressedUint8Array = new Uint8Array(
              compressedUint8ArrayString.length,
            );
            for (let i = 0; i < compressedUint8ArrayString.length; i++) {
              compressedUint8Array[i] =
                compressedUint8ArrayString.charCodeAt(i);
            }
            const stringified = pako.ungzip(compressedUint8Array, {
              to: "string",
            });
            const sharedDashboard: SharedDashboard = JSON.parse(stringified);
            const { sharedDashboardTitle, sharedDashboardContent } =
              sharedDashboard;
            await db.setItem(sharedDashboardTitle, sharedDashboardContent);
            setRefreshCount((prev) => prev + 1);
            selectADashboard("");
            await OBR.notification.show(
              `"${sharedDashboardTitle}" has just been shared with you!`,
              "SUCCESS",
            );
          } catch (e) {
            console.error(e);
            await OBR.notification.show("Dashboard Sharing Failed.", "ERROR");
          }
        },
      );
    }
  }, []);
};
