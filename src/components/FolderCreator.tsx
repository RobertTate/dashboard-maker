import { useRef, useState } from "react";

import AddFolderIcon from "../assets/addFolder.svg?react";
import DownloadIcon from "../assets/download.svg?react";
import FireIcon from "../assets/fire.svg?react";
import {
  buildFolderExport,
  findAllDashboardsWithinCurrentFolderStruc,
  generateLayouts,
  getCurrentFolder,
  getSurroundings,
} from "../functions";
import styles from "../styles/FolderCreator.module.css";
import { FolderCreatorProps } from "../types";
import type { Folder, MenuObject } from "../types/index.ts";

export const FolderCreator = ({
  menuObject,
  setMenuObject,
  setSyncStorage,
}: FolderCreatorProps) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const deleteFolderInputRef = useRef<HTMLInputElement>(null);
  const [deleteZoneIsOpen, setDeleteZoneIsOpen] = useState(false);

  const handleFolderCreation = () => {
    // The onLayoutChange in DashboardFileSystem.tsx will take care of saving to localForage
    const currentInd = menuObject?.currentFolder;

    let finalFolder: Folder = {};
    for (let i = 0; i < currentInd.length; i++) {
      if (i === 0) {
        finalFolder = menuObject?.folders?.[currentInd[i]];
      } else {
        finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
      }
    }

    const existingFolders =
      currentInd.length === 0
        ? menuObject.folders || {}
        : finalFolder.folders || {};
    const folderInput = folderInputRef.current as HTMLInputElement;
    const newFolderName = folderInput.value;
    folderInput.setCustomValidity("");

    // Don't allow blank folder names
    if (newFolderName === "") {
      folderInput.setCustomValidity("Give the folder a name!");
      folderInput.reportValidity();
      return;
    }

    // Don't allow duplicate folder names
    if (existingFolders[newFolderName]) {
      folderInput.setCustomValidity("Give the folder a UNIQUE name!");
      folderInput.reportValidity();
      return;
    }

    // Don't allow reserved names
    if (newFolderName === "Home" || newFolderName === "Premades") {
      folderInput.setCustomValidity(
        `Sorry, can't call it "${newFolderName}". That's a reserved keyword I'm using.`,
      );
      folderInput.reportValidity();
      return;
    }

    setMenuObject((prevMenuObj) => {
      const newMenuObj: MenuObject = structuredClone(prevMenuObj);
      const currentInd = newMenuObj?.currentFolder;
      if (newMenuObj.currentFolder.length === 0) {
        newMenuObj.folders[newFolderName] = {};
      } else {
        let finalFolder: Folder = {};
        for (let i = 0; i < currentInd.length; i++) {
          if (i === 0) {
            finalFolder = newMenuObj?.folders?.[currentInd[i]];
          } else {
            finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
          }
        }
        if (!finalFolder.folders) {
          finalFolder.folders = {};
        }
        finalFolder.folders[newFolderName] = {};
      }
      return newMenuObj;
    });

    // Clean Up the Input
    folderInput.value = "";
  };

  const handleFolderCreationOnEnter: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      handleFolderCreation();
    }
  };

  const generateFolderBreadCrumb = () => {
    const currentInd = menuObject.currentFolder;
    if (currentInd.length === 0) return null;

    const breadcrumb = ["Home", ...currentInd].reduce<JSX.Element[]>(
      (acc, curr, index) => {
        const isLast = index === currentInd.length;

        if (!isLast) {
          acc.push(
            <a
              title={`Click to go to ${curr}`}
              key={`breadcrumb-${index}`}
              className={styles["folder-creator-breadcrumb-link"]}
              onClick={() => {
                setMenuObject((prevMenuObj) => {
                  const newMenuObj = structuredClone(prevMenuObj);
                  if (index === 0) {
                    newMenuObj.currentFolder = [];
                  } else {
                    newMenuObj.currentFolder =
                      newMenuObj.currentFolder.slice(0, index);
                  }
                  return newMenuObj;
                });
                setSyncStorage((prev) => prev + 1);
              }}
            >
              {curr}
            </a>,
          );
        } else {
          acc.push(
            <span
              key={`breadcrumb-${index}`}
              className={styles["folder-creator-breadcrumb-current"]}
            >
              {curr}
            </span>,
          );
        }

        if (!isLast) {
          acc.push(<span key={`breadcrumb-${index}-sep`}> → </span>);
        }

        return acc;
      },
      [],
    );

    return breadcrumb;
  };

  const handleDownloadFolder = async () => {
    const currentInd = menuObject.currentFolder;
    if (currentInd.length === 0) return;

    const folderName = currentInd[currentInd.length - 1];
    const currentFolder = getCurrentFolder(menuObject);

    const folderExport = await buildFolderExport(
      folderName,
      currentFolder as Folder,
    );
    const jsonString = JSON.stringify(folderExport);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteFolder = () => {
    if (deleteFolderInputRef.current?.value === "DELETE") {
      deleteFolderInputRef.current.value = "";
      const currentFolder = getCurrentFolder(menuObject);
      const allDashboardsGettingMoved =
        findAllDashboardsWithinCurrentFolderStruc(currentFolder);

      setMenuObject((prevMenuObj) => {
        const newMenuObj: MenuObject = structuredClone(prevMenuObj);
        const currentInd = newMenuObj.currentFolder;
        if (currentInd.length === 0) {
          return newMenuObj;
        }

        const { parentFolder, parentFolderSystem } =
          getSurroundings(newMenuObj);

        // Delete the folder key reference.
        delete parentFolderSystem?.[currentInd[currentInd.length - 1]];
        parentFolder.dashboards = [
          ...(parentFolder?.dashboards || []),
          ...allDashboardsGettingMoved,
        ];

        newMenuObj.currentFolder.pop();

        // Regenerate layouts so moved-up dashboards are interactive
        const goUpButton =
          newMenuObj.currentFolder.length !== 0
            ? ["MoveDashUpButton"]
            : [];
        parentFolder.layouts = generateLayouts([
          ...goUpButton,
          ...Object.keys(parentFolder.folders || {}),
          ...(parentFolder.dashboards || []),
        ]);

        return newMenuObj;
      });

      setDeleteZoneIsOpen((prev) => !prev);
    } else {
      deleteFolderInputRef!.current!.setCustomValidity(
        "Only typing DELETE in all uppercase letters will trigger a folder deletion.",
      );
      deleteFolderInputRef!.current!.reportValidity();
    }
  };

  const handleFolderDeletionOnEnter: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      handleDeleteFolder();
    }
  };

  if (menuObject) {
    const isInsideAFolder = menuObject.currentFolder.length !== 0;
    const isInsidePremades =
      menuObject.currentFolder.includes("Premades");

    return (
      <>
        <div className={styles["folder-creator"]}>
          <button
            className={styles["folder-creator-button"]}
            onClick={handleFolderCreation}
            title="Create a folder to put dashboards in."
          >
            <AddFolderIcon
              className="icon-svg-folder"
              style={{
                width: "28px",
              }}
            />
          </button>
          <input
            className={styles["folder-creator-input"]}
            ref={folderInputRef}
            type="text"
            name="folderName"
            placeholder="Add Folder Name Here"
            required
            title="Enter a new folder name here, then hit enter or click the button on the left."
            onKeyDown={handleFolderCreationOnEnter}
            style={{ paddingLeft: "4px" }}
          />
        </div>
        {isInsideAFolder && (
          <div className={styles["folder-creator-options-container"]}>
            <div className={styles["folder-creator-options"]}>
              <div className={styles["folder-creator-breadcrumb"]}>
                {generateFolderBreadCrumb()}
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {!isInsidePremades && (
                  <button
                    className={styles["folder-creator-download-folder"]}
                    title="Download this folder."
                    onClick={handleDownloadFolder}
                  >
                    <DownloadIcon
                      className="icon-svg-download"
                      style={{
                        width: "20px",
                      }}
                    />
                  </button>
                )}
                <button
                  className={styles["folder-creator-delete-folder"]}
                  title="Delete this folder."
                  onClick={() => setDeleteZoneIsOpen((prev) => !prev)}
                >
                  <FireIcon
                    className="icon-svg-fire"
                    style={{
                      width: "20px",
                    }}
                  />
                </button>
              </div>
            </div>
            <div
              className={`${styles["folder-delete-zone"]} ${
                deleteZoneIsOpen ? styles["show-folder-delete-zone"] : ""
              }`}
            >
              <p>
                Type "DELETE" to delete this folder and subfolders. Dashboards
                will move up and out.
              </p>
              <div className={styles["folder-delete-zone-confirm"]}>
                <input
                  ref={deleteFolderInputRef}
                  type="text"
                  name="folderDeleteField"
                  required
                  onKeyDown={handleFolderDeletionOnEnter}
                />
                <button onClick={handleDeleteFolder}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } else {
    return null;
  }
};
