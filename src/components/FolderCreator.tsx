import { useRef } from "react";

import styles from "../styles/FolderCreator.module.css";
import { FolderCreatorProps } from "../types";

export const FolderCreator = ({
  menuObject,
  setMenuObject,
}: FolderCreatorProps) => {
  if (!menuObject) return null;
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderCreation = () => {
    // The onLayoutChange in DashboardFileSystem.tsx will take care of saving to localForage
    const existingFolders = menuObject.folders || [];
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

    setMenuObject((prevMenuObj) => {
      return {
        ...prevMenuObj,
        folders: {
          ...(prevMenuObj.folders || {}),
          [newFolderName]: {
            dashboards: [],
          },
        },
      };
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

  return (
    <div className={styles["folder-creator"]}>
      <button
        className={styles["folder-creator-button"]}
        onClick={handleFolderCreation}
      >
        Create A Folder
      </button>
      <input
        className={styles["folder-creator-input"]}
        ref={folderInputRef}
        type="text"
        name="folderName"
        required
        title="Enter a new folder name here."
        onKeyDown={handleFolderCreationOnEnter}
      />
    </div>
  );
};
