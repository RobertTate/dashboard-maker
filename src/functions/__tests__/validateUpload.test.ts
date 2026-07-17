import { describe, expect, it } from "vitest";

import { validateFolderUpload, validateUpload } from "../validateUpload";

const validDashboard = {
  layouts: {},
  widgets: [],
  isLocked: false,
};

describe("validateUpload", () => {
  it("accepts a minimal valid dashboard", () => {
    expect(validateUpload(validDashboard)).toBe(true);
  });

  it("accepts the optional columns, mode, and theme fields", () => {
    expect(
      validateUpload({
        ...validDashboard,
        columns: 8,
        mode: "dark",
        theme: "default",
      }),
    ).toBe(true);
  });

  it("rejects a dashboard missing a required field", () => {
    expect(validateUpload({ layouts: {}, isLocked: false })).toBe(false);
    expect(validateUpload({ layouts: {}, widgets: [] })).toBe(false);
  });

  it("rejects unknown extra properties", () => {
    expect(validateUpload({ ...validDashboard, evil: "payload" })).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(validateUpload({ ...validDashboard, isLocked: "yes" })).toBe(false);
    expect(validateUpload({ ...validDashboard, widgets: {} })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(validateUpload(null)).toBe(false);
    expect(validateUpload("a string")).toBe(false);
    expect(validateUpload([])).toBe(false);
  });
});

describe("validateFolderUpload", () => {
  const validFolderExport = {
    type: "folder-export",
    name: "My Folder",
    folderStructure: { dashboards: ["A"] },
    dashboards: { A: validDashboard },
  };

  it("accepts a valid folder export", () => {
    expect(validateFolderUpload(validFolderExport)).toBe(true);
  });

  it("rejects a wrong type discriminator", () => {
    expect(
      validateFolderUpload({ ...validFolderExport, type: "dashboard" }),
    ).toBe(false);
  });

  it("rejects a folder export missing required fields", () => {
    expect(
      validateFolderUpload({
        type: "folder-export",
        name: "My Folder",
        folderStructure: { dashboards: ["A"] },
      }),
    ).toBe(false);
  });

  it("rejects unknown extra properties", () => {
    expect(
      validateFolderUpload({ ...validFolderExport, extra: true }),
    ).toBe(false);
  });
});
