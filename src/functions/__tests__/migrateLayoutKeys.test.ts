import { describe, expect, it } from "vitest";

import type { MenuObject } from "../../types";
import { migrateLayoutKeys } from "../migrateLayoutKeys";

const entry = (i: string, x: number, y: number): ReactGridLayout.Layout => ({
  i,
  x,
  y,
  w: 1,
  h: 1,
});

describe("migrateLayoutKeys", () => {
  it("remaps legacy numeric root layout ids to names in render order (folders first, dashboards in db-key order)", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Zeta", "Alpha"],
      folders: { Premades: {} },
      layouts: {
        lg: [entry("0", 2, 0), entry("1", 0, 0), entry("2", 1, 0)],
      },
    };
    // db keys are alphabetical: Alpha, Zeta. Render order: [Premades, Alpha, Zeta]
    migrateLayoutKeys(menu, ["Alpha", "Zeta"]);

    expect(menu.layouts?.lg.map((e) => e.i)).toEqual([
      "Premades",
      "Alpha",
      "Zeta",
    ]);
    // positions ride along with their entries
    expect(menu.layouts?.lg[0]).toMatchObject({ i: "Premades", x: 2, y: 0 });
  });

  it("remaps nested folder layouts with the up-button occupying index 0", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: [],
      folders: {
        Adventures: {
          dashboards: ["Heist"],
          layouts: {
            lg: [entry("0", 0, 0), entry("1", 1, 0)],
          },
        },
      },
    };
    migrateLayoutKeys(menu, ["Heist"]);

    expect(menu.folders["Adventures"].layouts?.lg.map((e) => e.i)).toEqual([
      "MoveDashUpButton",
      "Heist",
    ]);
  });

  it("leaves already name-keyed layouts untouched", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Alpha"],
      folders: {},
      layouts: { lg: [entry("Alpha", 3, 2)] },
    };
    migrateLayoutKeys(menu, ["Alpha"]);
    expect(menu.layouts?.lg).toEqual([entry("Alpha", 3, 2)]);
  });

  it("drops out-of-range legacy entries instead of inventing names", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Alpha"],
      folders: {},
      layouts: { lg: [entry("0", 0, 0), entry("9", 1, 0)] },
    };
    migrateLayoutKeys(menu, ["Alpha"]);
    expect(menu.layouts?.lg.map((e) => e.i)).toEqual(["Alpha"]);
  });

  it("regenerates a clean layout when an item name is itself numeric (ambiguous remap)", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["7"],
      folders: {},
      layouts: { lg: [entry("0", 0, 0)] },
    };
    migrateLayoutKeys(menu, ["7"]);
    // No remap attempted; falls back to the clean fill order instead of
    // leaving numeric ids that would never match a tile.
    expect(Object.keys(menu.layouts ?? {})).toEqual([
      "lg",
      "md",
      "sm",
      "xs",
      "xxs",
    ]);
    expect(menu.layouts?.lg.map((e) => e.i)).toEqual(["7"]);
  });

  it("leaves partially-covered name-keyed layouts alone (incremental additions self-heal in the grid)", () => {
    // e.g. a dashboard dragged into a closed folder: the array gains "Beta"
    // but no layout entry exists yet. The migration must NOT reset the
    // folder — react-grid-layout auto-places just the new tile on render.
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Alpha", "Beta"],
      folders: {},
      layouts: { lg: [entry("Alpha", 3, 2)] },
    };
    migrateLayoutKeys(menu, ["Alpha", "Beta"]);
    expect(menu.layouts?.lg).toEqual([entry("Alpha", 3, 2)]);
  });

  it("regenerates a clean layout when a legacy remap can't cover every item", () => {
    // Legacy folder with drifted data: two tiles but only one saved entry.
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Alpha", "Beta"],
      folders: {},
      layouts: { lg: [entry("0", 3, 2)] },
    };
    migrateLayoutKeys(menu, ["Alpha", "Beta"]);
    const ids = menu.layouts?.lg.map((e) => e.i).sort();
    expect(ids).toEqual(["Alpha", "Beta"]);
    // Clean fill order, not a partial remap
    expect(menu.layouts?.lg.find((e) => e.i === "Alpha")).toMatchObject({
      x: 0,
      y: 0,
    });
  });

  it("excludes reserved DB keys from the render-order mapping", () => {
    const menu: MenuObject = {
      currentFolder: [],
      dashboards: ["Dash_Mode_String", "Alpha"],
      folders: {},
      layouts: { lg: [entry("0", 0, 0)] },
    };
    // db-key order would put Alpha after Dash_Mode_String, but reserved
    // keys never render, so index 0 must map to Alpha.
    migrateLayoutKeys(menu, ["Alpha", "Dash_Mode_String"]);
    expect(menu.layouts?.lg.map((e) => e.i)).toEqual(["Alpha"]);
  });
});
