import db from "../dbInstance";
import type {
  DashboardItemsProps,
  Folder,
  FolderExport,
  FolderSystem,
  MenuObject,
} from "../types";

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

const recursiveSearchFoldersForDashboards = (
  folder: Folder,
  cumulativeDashes: string[],
) => {
  if (folder.folders) {
    for (const subfolder in folder.folders) {
      cumulativeDashes = recursiveSearchFoldersForDashboards(
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
  const allDashboards: string[] = recursiveSearchFoldersForDashboards(
    currentFolder,
    [],
  );
  return allDashboards;
};

export const buildFolderExport = async (
  folderName: string,
  folder: Folder,
): Promise<FolderExport> => {
  const allDashNames = recursiveSearchFoldersForDashboards(folder, []);
  const dashboards: { [dashName: string]: DashboardItemsProps } = {};

  for (const name of allDashNames) {
    const data: DashboardItemsProps | null = await db.getItem(name);
    if (data) {
      dashboards[name] = data;
    }
  }

  return {
    type: "folder-export",
    name: folderName,
    folderStructure: folder,
    dashboards,
  };
};

const getUniqueName = (name: string, existingNames: Set<string>): string => {
  if (!existingNames.has(name)) return name;
  let counter = 2;
  while (existingNames.has(`${name} (${counter})`)) {
    counter++;
  }
  return `${name} (${counter})`;
};

const renameDashboardsInFolder = (
  folder: Folder,
  renameMap: Map<string, string>,
): Folder => {
  const result: Folder = { ...folder };

  if (result.dashboards) {
    result.dashboards = result.dashboards.map(
      (name) => renameMap.get(name) ?? name,
    );
  }

  if (result.folders) {
    const newFolders: FolderSystem = {};
    for (const key in result.folders) {
      newFolders[key] = renameDashboardsInFolder(
        result.folders[key],
        renameMap,
      );
    }
    result.folders = newFolders;
  }

  return result;
};

export const importFolderExport = async (
  folderExport: FolderExport,
  existingDashNames: string[],
  existingFolderNames: string[],
): Promise<{ folderName: string; folder: Folder; newDashNames: string[] }> => {
  const existingDashSet = new Set(existingDashNames);
  const existingFolderSet = new Set(existingFolderNames);

  // Resolve folder name collision
  const folderName = getUniqueName(folderExport.name, existingFolderSet);

  // Resolve dashboard name collisions and build rename map
  const renameMap = new Map<string, string>();
  for (const originalName of Object.keys(folderExport.dashboards)) {
    const newName = getUniqueName(originalName, existingDashSet);
    if (newName !== originalName) {
      renameMap.set(originalName, newName);
    }
    existingDashSet.add(newName);
  }

  // Update folder structure with renamed dashboards
  const folder = renameMap.size > 0
    ? renameDashboardsInFolder(folderExport.folderStructure, renameMap)
    : folderExport.folderStructure;

  // Write all dashboards to DB
  const newDashNames: string[] = [];
  for (const [originalName, data] of Object.entries(folderExport.dashboards)) {
    const finalName = renameMap.get(originalName) ?? originalName;
    await db.setItem(finalName, data);
    newDashNames.push(finalName);
  }

  return { folderName, folder, newDashNames };
};
