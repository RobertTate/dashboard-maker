import type { Folder, FolderSystem } from "../types";

export const filterByFolder = (
  dashBeingChecked: string,
  currentInd: string[],
  folders: FolderSystem,
) => {
  let finalFolder: Folder = {};
  for (let i = 0; i < currentInd.length; i++) {
    if (i === 0) {
      finalFolder = folders?.[currentInd[i]];
    } else {
      finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
    }
  }

  return finalFolder?.dashboards?.includes(dashBeingChecked);
};
