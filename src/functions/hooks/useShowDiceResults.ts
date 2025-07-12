// @ts-expect-error SOL
import DisplayResults from "@3d-dice/dice-ui/src/displayResults";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef, useState } from "react";

import "../../styles/DiceBox.css";

import type { RollBroadcast } from "../../types";

const DiceResults = new DisplayResults("#dice-result-sharing-box");

export const useShowDiceResults = (standalone: boolean) => {
  const [resultsQueue, setResultsQueue] = useState<Array<RollBroadcast>>([]);
  const sharedResultsBoxRef = useRef<HTMLDivElement | null>(null);
  const listenerIsAddedRef = useRef<boolean>(false);

  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker-dice-notification",
        async (event) => {
          try {
            const rollBroadcast = event?.data as RollBroadcast;
            const { finalResults, parsedNotationForMods, playerName } =
              rollBroadcast;
            setResultsQueue((prev) => {
              return [
                {
                  finalResults,
                  parsedNotationForMods,
                  playerName,
                },
                ...(prev || []),
              ];
            });
          } catch (e) {
            await OBR.notification.show("Something went wrong.", "ERROR");
          }
        },
      );
    }
  }, [standalone]);

  useEffect(() => {
    if (resultsQueue.length === 0) return;
    const firstToDisplay = resultsQueue[0];
    const { finalResults, parsedNotationForMods, playerName } = firstToDisplay;

    try {
      DiceResults.showResults(finalResults, parsedNotationForMods);
      sharedResultsBoxRef.current = document.querySelector(
        "#dice-result-sharing-box > div > div.results.showEffect",
      );
      sharedResultsBoxRef.current?.classList.add("shared-results-box");
      const playerNameArea = document.createElement("p");
      playerNameArea.textContent = playerName;
      playerNameArea.classList.add("player-name");
      sharedResultsBoxRef.current?.appendChild(playerNameArea);

      const handleShowNextResult = (event: Event) => {
        if (event.target instanceof Element) {
          if (event.target.closest(".shared-results-box")) {
            setResultsQueue((prev) => {
              const newResultsQueue = structuredClone(prev);
              newResultsQueue.shift();
              return newResultsQueue;
            });
          }
        }
      };

      if (listenerIsAddedRef.current === false) {
        listenerIsAddedRef.current = true;
        document.addEventListener("click", handleShowNextResult);
      }
    } catch (e) {
      OBR.notification.show("Something went wrong.", "ERROR");
    }
  }, [resultsQueue]);
};
