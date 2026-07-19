import { describe, expect, it } from "vitest";

import { generateLayouts } from "../generateLayouts";

describe("generateLayouts", () => {
  it("returns an empty layout for every breakpoint when given no items", () => {
    const layouts = generateLayouts([]);
    expect(Object.keys(layouts)).toEqual(["lg", "md", "sm", "xs", "xxs"]);
    for (const breakpoint of Object.values(layouts)) {
      expect(breakpoint).toEqual([]);
    }
  });

  it("creates one grid item per dashboard, keyed by name", () => {
    const layouts = generateLayouts(["A", "B", "C", "D"]);
    for (const breakpoint of Object.values(layouts)) {
      expect(breakpoint).toHaveLength(4);
      expect(breakpoint.map((item) => item.i)).toEqual(["A", "B", "C", "D"]);
    }
  });

  it("wraps items into rows of 3 at the lg breakpoint", () => {
    const layouts = generateLayouts(["A", "B", "C", "D", "E"]);
    const positions = layouts.lg.map(({ x, y }) => ({ x, y }));
    expect(positions).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it("wraps items into rows of 2 at the xxs breakpoint", () => {
    const layouts = generateLayouts(["A", "B", "C"]);
    const positions = layouts.xxs.map(({ x, y }) => ({ x, y }));
    expect(positions).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  it("makes every item 1x1 and bounded", () => {
    const layouts = generateLayouts(["A", "B"]);
    for (const item of layouts.lg) {
      expect(item.w).toBe(1);
      expect(item.h).toBe(1);
      expect(item.isBounded).toBe(true);
    }
  });
});
