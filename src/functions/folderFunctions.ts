import type { Folder, FolderSystem, MenuObject } from "../types";

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

export const getSurroundings = (menuObject: MenuObject) => {
  let finalFolder: Folder = {};
  let parentFolderSystem: FolderSystem = {};
  let parentFolder: Folder | MenuObject = {};
  const currentInd = menuObject.currentFolder;
  for (let i = 0; i < currentInd.length; i++) {
    if (i === 0) {
      finalFolder = menuObject?.folders?.[currentInd[i]];
      parentFolderSystem = menuObject.folders;
      parentFolder = menuObject;
    } else {
      parentFolderSystem = finalFolder?.folders || {};
      parentFolder = finalFolder;
      finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
    }
  }

  return {
    currentFolder: finalFolder,
    parentFolder,
    parentFolderSystem,
  };
};

const recursiveFindFolders = (folder: Folder, cumulativeDashes: string[]) => {
  if (folder.folders) {
    for (const subfolder in folder.folders) {
      cumulativeDashes = recursiveFindFolders(
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
  const allDashboards: string[] = recursiveFindFolders(currentFolder, []);
  return allDashboards;
};


const recursiveFindDashboard = (folder: MenuObject | Folder, dashName: string) => {
  if (folder.dashboards?.includes(dashName)) {
    return folder;
  }
  if (folder.folders) {
    for (const subfolder in folder.folders) {
      return recursiveFindDashboard(folder.folders[subfolder], dashName)
    }
  }
  return null;
}

export const getFolderOfSpecificDashboard = (
  menuObject: MenuObject,
  dashName: string,
) => {
  const folderOfDashboard: MenuObject | Folder | null = recursiveFindDashboard(menuObject, dashName);
  return folderOfDashboard;
}
