import { useMemo } from "react";

import MoveUpIcon from "../../assets/moveUp.svg?react";
import type { FolderSystem, MenuObject } from "../../types";

export type MenuItemHandlers = {
  onFolderClick: (folderName: string) => void;
  onMoveUpClick: () => void;
};

export const useCreateMenuItems = (
  menuObject: MenuObject,
  filteredFolders: FolderSystem,
  filteredDashboards: string[],
  { onFolderClick, onMoveUpClick }: MenuItemHandlers,
) => {
  const memoizedChildren = useMemo(() => {
    let keyIndex = 0;
    let xPosition = 0;
    let row = 0;
    let backButton: JSX.Element[] = [];

    if (menuObject.currentFolder.length !== 0) {
      keyIndex += 1;
      backButton = [
        <button
          title={`Click to go up a level. Drag a dashboard here to bring it up a level.`}
          key="MoveDashUpButton"
          data-up-folder={true}
          className="moveFolderUp"
          onClick={onMoveUpClick}
          data-grid={{
            static: true,
            x: xPosition,
            y: row,
            w: 1,
            h: 1,
          }}
        >
          <MoveUpIcon
            className="icon-svg"
            style={{
              width: "26px",
            }}
          />
        </button>,
      ];

      xPosition += 1;
    }

    const folders = (Object.keys(filteredFolders) || []).map((folderName) => {
      const key = keyIndex;
      keyIndex += 1;

      const folderToReturn = (
        <button
          className="folder"
          key={folderName}
          title="Click to enter this folder. Drag a dashboard here to put it in the folder."
          data-folder={folderName}
          onClick={() => onFolderClick(folderName)}
          data-grid={{
            static: true,
            x: xPosition,
            y: row,
            w: 1,
            h: 1,
          }}
        >
          <svg viewBox="0 0 194 18" style={{ width: "100%", height: "100%" }}>
            {folderName.length >= 26 ? (
              <text
                x="0"
                y="15"
                textLength="194"
                lengthAdjust="spacingAndGlyphs"
              >
                {folderName}
              </text>
            ) : (
              <text x="50%" y="15" style={{ textAnchor: "middle" }}>
                {folderName}
              </text>
            )}
          </svg>
        </button>
      );

      xPosition += 1;

      if ((key + 1) % 3 === 0) {
        row += 1;
        xPosition = 0;
      }

      return folderToReturn;
    });

    const dashboards = filteredDashboards.map((dash) => {
      const key = keyIndex;
      keyIndex += 1;

      const dashboardToReturn = (
        <button
          title={`Click to view and edit this dashboard.`}
          data-dash={dash}
          key={dash}
        >
          <svg viewBox="0 0 194 18" style={{ width: "100%", height: "100%" }}>
            {dash.length >= 26 ? (
              <text
                x="0"
                y="15"
                textLength="194"
                lengthAdjust="spacingAndGlyphs"
              >
                {dash}
              </text>
            ) : (
              <text x="50%" y="15" style={{ textAnchor: "middle" }}>
                {dash}
              </text>
            )}
          </svg>
        </button>
      );

      xPosition += 1;

      if ((key + 1) % 3 === 0) {
        row += 1;
        xPosition = 0;
      }

      return dashboardToReturn;
    });

    return [...backButton, ...folders, ...dashboards];
  }, [
    filteredDashboards,
    filteredFolders,
    menuObject.currentFolder,
    onFolderClick,
    onMoveUpClick,
  ]);

  return memoizedChildren;
};
