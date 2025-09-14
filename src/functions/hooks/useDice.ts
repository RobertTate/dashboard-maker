// @ts-expect-error SOL
import DiceBox from "@3d-dice/dice-box";
// @ts-expect-error SOL
import DiceParser from "@3d-dice/dice-parser-interface";
import { DiceRoller, type RollBase } from "@3d-dice/dice-roller-parser";
// @ts-expect-error SOL
import DisplayResults from "@3d-dice/dice-ui/src/displayResults";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import shareRoll from "../../assets/shareRoll.svg";

const DR = new DiceRoller();
const DP = new DiceParser();
const DiceResults = new DisplayResults("#dice-box");

type DiceBoxInstance = InstanceType<typeof DiceBox>;

export const useDice = () => {
  const [dice, setDice] = useState<DiceBoxInstance>(null);

  useEffect(() => {
    let diceBoxCanvas = document.getElementById("dice-canvas");
    if (!dice && !diceBoxCanvas) {
      const Dice: DiceBoxInstance = new DiceBox("#dice-box", {
        id: "dice-canvas",
        assetPath: "/assets/",
        startingHeight: 8,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 0.9,
        themeColor: "#8447ff",
        gravity: 8,
      });

      let diceNotation: string;
      Dice.init().then(() => {
        let wasJustTouchedOnMobile = false;

        const handleSetup = (event: Event) => {
          diceBoxCanvas = document.getElementById("dice-canvas");
          const eventTarget = event.target as HTMLElement;
          if (eventTarget.dataset?.diceNotation) {
            if (event.type === "touchend") {
              event.preventDefault();
              event.stopPropagation();
            }
            diceNotation = eventTarget.dataset?.diceNotation;
            const rollObj: Array<Record<string, unknown>> = DP.parseNotation(diceNotation);
            const diceColor = getComputedStyle(document.documentElement)
              .getPropertyValue("--dice-color")
              .trim();
            if (diceColor) {
              for (const roll of rollObj) {
                roll.themeColor = diceColor;
              }
            }

            Dice.roll(rollObj);
            DiceResults.clear();
          } else if (
            diceBoxCanvas &&
            window.getComputedStyle(diceBoxCanvas).display !== "none"
          ) {
            Dice.clear();
            DiceResults.clear();
          }
        };

        const handleClickSetup = (event: Event) => {
          if (wasJustTouchedOnMobile) {
            wasJustTouchedOnMobile = false;
            return;
          }
          handleSetup(event);
        };

        const handleTouchSetup = (event: Event) => {
          wasJustTouchedOnMobile = true;
          handleSetup(event);
        };

        document.addEventListener("mousedown", handleClickSetup);
        document.addEventListener("touchend", handleTouchSetup);
        setDice(Dice);
      });

      Dice.onRollComplete = async (results: unknown) => {
        const rerolls = DP.handleRerolls(results);
        if (rerolls.length) {
          // eslint-disable-next-line
          rerolls.forEach((roll: any) => Dice.add(roll, roll.groupId));
          return rerolls;
        }
        const parsedNotationForMods = DR.parse(diceNotation);
        const finalResults: RollBase = DP.parseFinalResults(results);
        DiceResults.showResults(finalResults, parsedNotationForMods);

        if (OBR.isAvailable) {
          const roleValue = await OBR.player.getRole();
          // GMs can choose to share their roll or not
          if (roleValue === "GM") {
            const diceResultsBox = document.querySelector(
              "#dice-box > div > div.results.showEffect",
            );
            const shareButton = document.createElement("button");
            const svgResult = await fetch(shareRoll);
            const svgText = await svgResult.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, "image/svg+xml");
            const svgEl = doc.documentElement;
            shareButton.title = "Share Roll Result?";
            shareButton.appendChild(svgEl);
            diceResultsBox?.appendChild(shareButton);

            shareButton.addEventListener("click", async () => {
              try {
                const playerName = await OBR.player.getName();
                await OBR.broadcast.sendMessage(
                  "com.roberttate.dashboard-maker-dice-notification",
                  {
                    finalResults,
                    parsedNotationForMods,
                    playerName,
                  },
                );
              } catch (e) {
                await OBR.notification.show(`Something went wrong`, "ERROR");
              }
            });
          } else {
            // Players dont get to choose to share their roll result
            try {
              const playerName = await OBR.player.getName();
              await OBR.broadcast.sendMessage(
                "com.roberttate.dashboard-maker-dice-notification",
                {
                  finalResults,
                  parsedNotationForMods,
                  playerName,
                },
              );
            } catch (e) {
              await OBR.notification.show(`Something went wrong`, "ERROR");
            }
          }
        }
      };
    }
  }, [dice]);

  useEffect(() => {
    return () => dice?.clear();
  }, [dice]);
};
