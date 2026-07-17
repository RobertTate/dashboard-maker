import { describe, expect, it } from "vitest";

import type { SharedDashboard } from "../../types";
import { compressToB64String, decompressFromB64String } from "../compression";

describe("compression round-trip", () => {
  it("round-trips a shared dashboard payload", () => {
    const payload: SharedDashboard = {
      sharedDashboardTitle: "GM Screen",
      sharedDashboardContent: {
        layouts: { lg: [{ x: 0, y: 0, w: 1, h: 1, i: "0" }] },
        widgets: [{ id: "abc", content: "# Hello" }],
        isLocked: false,
        columns: 8,
      },
      target: "ALL",
    };

    const encoded = compressToB64String(payload);
    expect(typeof encoded).toBe("string");
    expect(decompressFromB64String<SharedDashboard>(encoded)).toEqual(payload);
  });

  it("round-trips unicode content (emoji, accents)", () => {
    const payload = { content: "✏️ Café ⭐ 🎲 — «notes»" };
    const encoded = compressToB64String(payload);
    expect(decompressFromB64String<typeof payload>(encoded)).toEqual(payload);
  });

  it("round-trips a payload large enough to exceed the fromCharCode arg limit", () => {
    // ~1M chars of low-compressibility content produces a compressed
    // buffer far beyond the ~64k argument-spread limit the old inline
    // implementation relied on.
    const payload = {
      content: Array.from({ length: 100_000 }, () =>
        Math.random().toString(36),
      ).join(" "),
    };
    const encoded = compressToB64String(payload);
    expect(decompressFromB64String<typeof payload>(encoded)).toEqual(payload);
  });

  it("produces base64 output", () => {
    const encoded = compressToB64String({ a: 1 });
    expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});
