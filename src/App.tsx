import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import PopOver from "./components/PopOver";
import { Role } from "./types";

// @ts-ignore
import DiceBox from "@3d-dice/dice-box";
// @ts-ignore
import DisplayResults from "@3d-dice/dice-ui/src/displayResults";
// @ts-ignore
import DiceParser from '@3d-dice/dice-parser-interface'
// @ts-ignore
import { DiceRoller } from "@3d-dice/dice-roller-parser"

const DR = new DiceRoller()
const DP = new DiceParser();
const DiceResults = new DisplayResults("#dice-box");

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [role, setRole] = useState<Role>(undefined);
  const [dice, setDice] = useState<any>(null);

  useEffect(() => {
    const initDashboardMaker = async () => {
      const roleValue = await OBR.player.getRole();
      setRole(roleValue);
      setAppIsReady(true);
    };

    OBR.onReady(() => {
      initDashboardMaker();
    });
  }, []);

  useEffect(() => {
    let diceBoxCanvas = document.getElementById("dice-canvas");
    if (!dice && !diceBoxCanvas) {
      const Dice = new DiceBox("#dice-box", {
        id: "dice-canvas",
        assetPath: "/assets/",
        startingHeight: 8,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 0.9,
        themeColor: "#8447ff",
        gravity: 8,
      });

      let diceNotation: any;
      Dice.init().then(() => {
        let wasJustTouchedOnMobile = false;

        const handleSetup = (event: Event) => {
          diceBoxCanvas = document.getElementById("dice-canvas");
          const eventTarget = event.target as HTMLElement;
          if (eventTarget.dataset?.diceNotation) {
            diceNotation = eventTarget.dataset?.diceNotation;
            const rollObj = DP.parseNotation(diceNotation);
            Dice.roll(rollObj);
            DiceResults.clear();
          } else if (diceBoxCanvas && window.getComputedStyle(diceBoxCanvas).display !== "none") {
            Dice.clear();
            DiceResults.clear();
          }
        }

        const handleClickSetup = (event: Event) => {
          if (wasJustTouchedOnMobile) {
            wasJustTouchedOnMobile = false;
            return;
          }
          handleSetup(event);
        }

        const handleTouchSetup = (event: Event) => {
          wasJustTouchedOnMobile = true;
          handleSetup(event);
        }

        document.addEventListener("mousedown", handleClickSetup);
        document.addEventListener("touchend", handleTouchSetup);
        setDice(Dice)
      });

      Dice.onRollComplete = (results: any) => {
        const rerolls = DP.handleRerolls(results);
        if (rerolls.length) {
          rerolls.forEach((roll: any) => Dice.add(roll, roll.groupId));
          return rerolls;
        }
        const parsedNotationForMods = DR.parse(diceNotation)
        const finalResults = DP.parseFinalResults(results);
        DiceResults.showResults(finalResults, parsedNotationForMods);
      }
    }
  }, []);

  useEffect(() => {
    return () => dice?.clear()
  }, [dice]);

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
