import OBR from "@owlbear-rodeo/sdk";
import { useEffect } from "react";

import { formDiceResultString } from "../";
import type { RollBroadcast } from "../../types";

export const useShowDiceResults = (standalone: boolean) => {
  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker-dice-notification",
        async (event) => {
          try {
            const rollBroadcast = event?.data as RollBroadcast;
            const { playerName, rawResults, rollResult, diceNotation } =
              rollBroadcast;

            const resultString = formDiceResultString(
              playerName,
              diceNotation,
              rollResult,
              rawResults,
            );

            await OBR.notification.show(resultString, "SUCCESS");
          } catch (e) {
            await OBR.notification.show("Something went wrong.", "ERROR");
          }
        },
      );
    }
  }, []);
};
