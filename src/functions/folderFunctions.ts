import type { Folder, MenuObject } from "../types";

export const getCurrentFolder = (menuObject: MenuObject) => {
  if (menuObject.currentFolder.length === 0) {
    return menuObject;
  }

  let finalFolder: Folder = {};
  const currentInd = menuObject.currentFolder;
  for (let i = 0; i < currentInd.length; i++) {
    if (i === 0) {
      finalFolder = menuObject?.folders?.[currentInd[i]];
    } else {
      finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
    }
  }
  return finalFolder;
};

const recursiveFind = (folder: Folder, cumulativeDashes: string[]) => {
  if (folder.folders) {
    for (const subfolder in folder.folders) {
      cumulativeDashes = recursiveFind(
        folder.folders[subfolder],
        cumulativeDashes,
      );
    }
  }

  return [...cumulativeDashes, ...(folder.dashboards || [])];
};

export const findAllDashboardsWithinCurrentFolderStruc = (
  currentFolder: Folder,
) => {
  const allDashboards: string[] = recursiveFind(currentFolder, []);

  return allDashboards;
};
