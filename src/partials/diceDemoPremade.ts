const diceDemo = {
  layouts: {
    lg: [
      {
        w: 1,
        h: 1,
        x: 0,
        y: 0,
        i: "New Widget",
        moved: false,
        static: true,
        isDraggable: false,
        isResizable: false,
      },
      {
        w: 1,
        h: 1,
        x: 0,
        y: 1,
        i: "EubFsmS5K3",
        moved: false,
        static: false,
      },
    ],
    md: [],
    sm: [],
    xs: [
      {
        w: 1,
        h: 1,
        x: 0,
        y: 0,
        i: "New Widget",
        moved: false,
        static: true,
        isDraggable: false,
        isResizable: false,
      },
      {
        w: 8,
        h: 26,
        x: 0,
        y: 1,
        i: "EubFsmS5K3",
        moved: false,
        static: false,
      },
    ],
    xxs: [
      {
        w: 1,
        h: 1,
        x: 0,
        y: 0,
        i: "New Widget",
        moved: false,
        static: true,
        isDraggable: false,
        isResizable: false,
      },
      {
        w: 4,
        h: 36,
        x: 0,
        y: 1,
        i: "EubFsmS5K3",
        moved: false,
        static: false,
      },
    ],
  },
  widgets: [
    {
      id: "EubFsmS5K3",
      content:
        '# Dice Rolling In Dashboard Maker\n\n***\n\nThe following are examples of what currently works to trigger dice notation. If you write these notations out in the same way and then hit space, and you should get the same outcomes as the examples below.\n\n* Regular old dice rolls: :dice[1d4], :dice[1d6], :dice[1d8], :dice[1d10], :dice[1d12], :dice[1d20], :dice[1d100]\n* Roll any dice with `+`/`*`/`-`/`/` modifiers: :dice[1d12+4]\n* Roll multiple different dice: :dice[1d6+1d4]\n* Roll multiple different dice, with modifiers: :dice[1d4+2+1d6-3]\n* Roll if 1 dice is greater (`>`) or less than (`<`) a target: :dice[1d20>10]\n* "DC" Notation (does the same as the example above): :dice[DC10]{isDCNotation="true"}\n* "Modifier" Notation: :dice[+7]{isModNotation="true"}\n* Roll if multiple dice that are greater or less than the target: :dice[6d6>3]\n* Roll and keep highest: :dice[2d20kh1]\n* Roll and keep lowest: :dice[2d20kl1]\n* Roll and drop highest: :dice[2d20dh1]\n* Roll and drop lowest: :dice[2d20dl1]\n* Exploding dice (it rerolls crits): :dice[8d6!]\n* Labelling a dice roll: :dice[1d6+3+1d8#Might]\n\n\n\nYou can also now display ALIAS TEXT for any dice roll. Before you hit space, type "@" at the end of the dice notation, followed by the text you want to display, then hit space.\n\nExample:\n\n:dice[4d4#Healing!]{alias="InstaHeal"}\n\n> *Try other notations/combinations of notations at your own peril! They probs won\'t work right. But if there\'s something you really wish you could still do with this dice notation feature, lemme know about it on the Owlbear Rodeo Discord!*',
    },
  ],
  isLocked: true,
  columns: 8,
};

export default diceDemo;
