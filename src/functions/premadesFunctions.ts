import db from "../dbInstance";
import type { MenuObject, PremadeDashConfig } from "../types";

async function addPremade(premade: PremadeDashConfig) {
  const premadeContent = await import(`../partials/${premade.fileName}.ts`);
  await db.setItem(premade.dashName, premadeContent.default);
  return premade.dashName;
}

export async function checkAndAddPremades(keys: string[]) {
  const premadesArrayToCheckAgainst: PremadeDashConfig[] = [
    {
      fileName: "armorDashPremade",
      dashName: "⭐ Armor ⭐",
    },
    {
      fileName: "simpleWeaponsDashPremade",
      dashName: "⭐ Simple Weapons ⭐",
    },
    {
      fileName: "martialWeaponsDashPremade",
      dashName: "⭐ Martial Weapons ⭐",
    },
    {
      fileName: "adventuringGearDashPremade",
      dashName: "⭐ Adventuring Gear ⭐",
    },
    {
      fileName: "conditionsDashPremade",
      dashName: "⭐ Conditions ⭐",
    },
    {
      fileName: "skillsDashPremade",
      dashName: "⭐ Skills ⭐",
    },
    {
      fileName: "diceDemoPremade",
      dashName: "⭐ Dice Demo ⭐",
    },
    {
      fileName: "devNotePremade",
      dashName: "⭐ Developer Note ⭐",
    },
  ];

  const promises: Promise<string>[] = [];

  premadesArrayToCheckAgainst.forEach((premade) => {
    if (!keys.includes(premade.dashName)) {
      promises.push(addPremade(premade));
    }
  });

  const newPremades = await Promise.all(promises);

  return newPremades;
}

export const applyPremades = (menuObject: MenuObject, premades: string[]) => {
  menuObject.folders["Premades"] = {
    layouts: {
      ...(menuObject.folders?.["Premades"]?.layouts || {}),
    },
    dashboards: [...(menuObject.folders?.["Premades"]?.dashboards || [])],
    folders: {
      ...(menuObject.folders?.["Premades"]?.folders || {}),
      "5th Edition D&D": {
        folders: {
          ...(menuObject.folders?.["Premades"]?.folders?.["5th Edition D&D"]
            ?.folders || {}),
        },
        dashboards: [
          ...(menuObject.folders?.["Premades"]?.folders?.["5th Edition D&D"]
            ?.dashboards || []),
          ...premades,
        ],
        layouts: {
          ...(menuObject.folders?.["Premades"]?.folders?.["5th Edition D&D"]
            ?.layouts || {}),
        },
      },
    },
  };
};
