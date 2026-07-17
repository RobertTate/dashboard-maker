import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardItemsProps, FolderExport, MenuObject } from "../../types";
import {
  buildFolderExport,
  findAllDashboardsWithinCurrentFolderStruc,
  getCurrentFolder,
  getSurroundings,
  importFolderExport,
} from "../folderFunctions";

vi.mock("../../dbInstance", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    keys: vi.fn(),
  },
}));

import db from "../../dbInstance";

const mockDb = vi.mocked(db);

const makeDashboard = (): DashboardItemsProps => ({
  layouts: {},
  widgets: [],
  isLocked: false,
  columns: 8,
});

const makeMenu = (): MenuObject => ({
  currentFolder: [],
  dashboards: ["Root Dash"],
  folders: {
    Adventures: {
      dashboards: ["Curse of Strahd"],
      folders: {
        "One Shots": {
          dashboards: ["Mini Dungeon", "Heist Night"],
        },
      },
    },
    Premades: {
      dashboards: ["⭐ Conditions"],
    },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentFolder", () => {
  it("returns the menu object itself at the root", () => {
    const menu = makeMenu();
    expect(getCurrentFolder(menu)).toBe(menu);
  });

  it("returns a first-level folder", () => {
    const menu = makeMenu();
    menu.currentFolder = ["Adventures"];
    expect(getCurrentFolder(menu)).toBe(menu.folders["Adventures"]);
  });

  it("returns a nested folder by walking the currentFolder path", () => {
    const menu = makeMenu();
    menu.currentFolder = ["Adventures", "One Shots"];
    expect(getCurrentFolder(menu)).toBe(
      menu.folders["Adventures"].folders?.["One Shots"],
    );
  });
});

describe("getSurroundings", () => {
  it("returns the folder plus its parent at one level deep", () => {
    const menu = makeMenu();
    menu.currentFolder = ["Adventures"];
    const { currentFolder, parentFolder, parentFolderSystem } =
      getSurroundings(menu);
    expect(currentFolder).toBe(menu.folders["Adventures"]);
    expect(parentFolder).toBe(menu);
    expect(parentFolderSystem).toBe(menu.folders);
  });

  it("returns the folder plus its parent at two levels deep", () => {
    const menu = makeMenu();
    menu.currentFolder = ["Adventures", "One Shots"];
    const { currentFolder, parentFolder, parentFolderSystem } =
      getSurroundings(menu);
    expect(currentFolder).toBe(menu.folders["Adventures"].folders?.["One Shots"]);
    expect(parentFolder).toBe(menu.folders["Adventures"]);
    expect(parentFolderSystem).toBe(menu.folders["Adventures"].folders);
  });
});

describe("findAllDashboardsWithinCurrentFolderStruc", () => {
  it("collects dashboards from the folder and all nested subfolders", () => {
    const menu = makeMenu();
    const all = findAllDashboardsWithinCurrentFolderStruc(menu);
    expect(all.sort()).toEqual(
      [
        "Root Dash",
        "Curse of Strahd",
        "Mini Dungeon",
        "Heist Night",
        "⭐ Conditions",
      ].sort(),
    );
  });

  it("returns an empty array for an empty folder", () => {
    expect(findAllDashboardsWithinCurrentFolderStruc({})).toEqual([]);
  });
});

describe("buildFolderExport", () => {
  it("bundles the folder structure with every dashboard's data from the DB", async () => {
    const dashData = makeDashboard();
    mockDb.getItem.mockResolvedValue(dashData);

    const folder = {
      dashboards: ["A"],
      folders: { Sub: { dashboards: ["B"] } },
    };
    const result = await buildFolderExport("My Folder", folder);

    expect(result.type).toBe("folder-export");
    expect(result.name).toBe("My Folder");
    expect(result.folderStructure).toBe(folder);
    expect(Object.keys(result.dashboards).sort()).toEqual(["A", "B"]);
    expect(result.dashboards["A"]).toBe(dashData);
  });

  it("skips dashboards that are missing from the DB", async () => {
    mockDb.getItem.mockResolvedValue(null);
    const result = await buildFolderExport("Empty", { dashboards: ["Ghost"] });
    expect(result.dashboards).toEqual({});
  });
});

describe("importFolderExport", () => {
  const makeExport = (): FolderExport => ({
    type: "folder-export",
    name: "Imported",
    folderStructure: {
      dashboards: ["Alpha"],
      folders: { Nested: { dashboards: ["Beta"] } },
    },
    dashboards: {
      Alpha: makeDashboard(),
      Beta: makeDashboard(),
    },
  });

  it("imports without renaming when there are no collisions", async () => {
    const result = await importFolderExport(makeExport(), [], []);

    expect(result.folderName).toBe("Imported");
    expect(result.newDashNames.sort()).toEqual(["Alpha", "Beta"]);
    expect(result.folder).toEqual(makeExport().folderStructure);
    expect(mockDb.setItem).toHaveBeenCalledTimes(2);
    expect(mockDb.setItem).toHaveBeenCalledWith("Alpha", expect.anything());
    expect(mockDb.setItem).toHaveBeenCalledWith("Beta", expect.anything());
  });

  it("renames colliding dashboards with a (2) suffix, including in nested folders", async () => {
    const result = await importFolderExport(
      makeExport(),
      ["Alpha", "Beta"],
      [],
    );

    expect(result.newDashNames.sort()).toEqual(["Alpha (2)", "Beta (2)"]);
    expect(result.folder.dashboards).toEqual(["Alpha (2)"]);
    expect(result.folder.folders?.["Nested"].dashboards).toEqual(["Beta (2)"]);
    expect(mockDb.setItem).toHaveBeenCalledWith("Alpha (2)", expect.anything());
    expect(mockDb.setItem).toHaveBeenCalledWith("Beta (2)", expect.anything());
  });

  it("increments the suffix until the name is free", async () => {
    const result = await importFolderExport(
      makeExport(),
      ["Alpha", "Alpha (2)", "Alpha (3)"],
      [],
    );
    expect(result.newDashNames).toContain("Alpha (4)");
  });

  it("renames a colliding folder name without touching dashboards", async () => {
    const result = await importFolderExport(
      makeExport(),
      [],
      ["Imported", "Imported (2)"],
    );
    expect(result.folderName).toBe("Imported (3)");
    expect(result.newDashNames.sort()).toEqual(["Alpha", "Beta"]);
  });

  it("renames imported dashboards that collide with reserved DB keys", async () => {
    const folderExport = makeExport();
    folderExport.dashboards = { Menu_Object: makeDashboard() };
    folderExport.folderStructure = { dashboards: ["Menu_Object"] };

    const result = await importFolderExport(folderExport, [], []);

    expect(result.newDashNames).toEqual(["Menu_Object (2)"]);
    expect(result.folder.dashboards).toEqual(["Menu_Object (2)"]);
    expect(mockDb.setItem).not.toHaveBeenCalledWith(
      "Menu_Object",
      expect.anything(),
    );
  });

  it("does not let two imported dashboards collide with each other after renaming", async () => {
    const folderExport = makeExport();
    folderExport.dashboards = {
      Alpha: makeDashboard(),
      "Alpha (2)": makeDashboard(),
    };
    folderExport.folderStructure = { dashboards: ["Alpha", "Alpha (2)"] };

    const result = await importFolderExport(folderExport, ["Alpha"], []);

    // "Alpha" renames to "Alpha (2)", which then forces the imported
    // "Alpha (2)" to rename to "Alpha (2) (2)" — suffixes append to the
    // full name rather than incrementing an existing counter.
    expect(result.newDashNames.sort()).toEqual(["Alpha (2)", "Alpha (2) (2)"]);
  });
});
