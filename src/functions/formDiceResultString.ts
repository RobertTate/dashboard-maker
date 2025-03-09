export const formDiceResultString = (
  playerName: string,
  diceNotation: string,
  rollResult: number,
  rawResults: any,
) => {
  const finalRoll = rawResults?.[0]?.value;
  if (diceNotation.includes("!")) {
    return `${playerName} rolled ${diceNotation.substring(
      0,
      diceNotation.length - 1,
    )} EXPLODING DIE and got a ${rollResult}`;
  }

  if (diceNotation.includes(">") && !diceNotation.includes("+")) {
    if (diceNotation.includes("1d20")) {
      const DC = diceNotation.substring(5);
      const outcome = rollResult === 1 ? "succeeded" : "failed";
      return `${playerName} rolled a DC${DC} check and ${outcome} with ${finalRoll}`;
    } else {
      return `${playerName} rolled ${diceNotation} and got ${rollResult} over the goal number, totalling ${finalRoll}`;
    }
  } else if (diceNotation.includes("<")) {
    return `${playerName} rolled ${diceNotation} and got ${rollResult} under the goal number, totalling ${finalRoll}`;
  }

  return `${playerName} rolled ${diceNotation} and got ${rollResult}`;
};
