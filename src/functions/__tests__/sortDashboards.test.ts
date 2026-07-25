import { describe, expect, it } from "vitest";

import { sortDashboards } from "../sortDashboards";

describe("sortDashboards", () => {
  it("returns the array untouched for insertion order", () => {
    const dashboards = ["Zelda", "Aragorn", "Mordenkainen"];
    expect(sortDashboards(dashboards, "insertion")).toEqual([
      "Zelda",
      "Aragorn",
      "Mordenkainen",
    ]);
  });

  it("sorts A to Z case-insensitively", () => {
    expect(sortDashboards(["banana", "Apple", "cherry"], "az")).toEqual([
      "Apple",
      "banana",
      "cherry",
    ]);
  });

  it("sorts numbered names numerically, not lexicographically", () => {
    expect(
      sortDashboards(["Session 10", "Session 2", "Session 1"], "az"),
    ).toEqual(["Session 1", "Session 2", "Session 10"]);
  });

  it("does not mutate the input array", () => {
    const dashboards = ["b", "a", "c"];
    sortDashboards(dashboards, "az");
    expect(dashboards).toEqual(["b", "a", "c"]);
  });
});
