import isEqual from "lodash.isequal";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactGridLayout, {
  type ItemCallback,
  Responsive,
  WidthProvider,
} from "react-grid-layout";

import moveUp from "../assets/moveUp.svg";
import db from "../dbInstance";
import { collisionInfo } from "../functions/collisions";
import { getCurrentFolder, getSurroundings } from "../functions/folderFunctions";
import { generateLayouts } from "../functions/generateLayouts";
import {
  Breakpoint,
  DashboardFileSystemProps,
  MenuObject,
} from "../types";

const DashboardFileSystem = memo(
  ({
    dashBoardsArray,
    menuObject,
    selectADashboard,
    setMenuObject,
  }: DashboardFileSystemProps) => {
    if (!menuObject) return null;
    const folderRefs = useRef<HTMLDivElement[]>([]);
    const folderUpBtnRef = useRef<HTMLButtonElement | null>(null);
    const ResponsiveReactGridLayout = useMemo(
      () => WidthProvider(Responsive),
      [],
    );

    const currentFolderObject = useMemo(() => {
      return getCurrentFolder(menuObject);
    }, [menuObject.folders, menuObject.currentFolder, menuObject.layouts]);

    // This useEffect fixes an intermittent issue with react-grid-layout concerning layouts
    useEffect(() => {
      if (
        currentFolderObject.layouts &&
        Object.keys(currentFolderObject.layouts || {}).length !== 5
      ) {
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = JSON.parse(
            JSON.stringify(prevMenuObj),
          );
          const currentFolder = getCurrentFolder(newMenuObj);
          let goUpButton = [];
          if (newMenuObj.currentFolder.length !== 0) {
            goUpButton.push("MoveDashUpButton");
          }
          currentFolder.layouts = generateLayouts([
            ...goUpButton,
            ...Object.keys(currentFolder.folders || {}),
            ...(currentFolder.dashboards || []),
          ]);
          return newMenuObj;
        });
      }
    }, [currentFolderObject.layouts]);

    // Filter out folders that are not part of the current folder
    const filteredFolders = useMemo(() => {
      if (currentFolderObject.folders) {
        return currentFolderObject.folders;
      } else {
        return {};
      }
    }, [currentFolderObject]);

    // Filter out dashboards that are not part of the current folder
    const filteredDashboards = useMemo(() => {
      return dashBoardsArray.filter((dash) => {
        if (dash === "Menu_Object") return false;
        return currentFolderObject.dashboards?.includes(dash);
      });
    }, [dashBoardsArray, currentFolderObject]);

    // Use gripProps for items and cols, as items is not typed correctly and cols is needed in two places
    const gridProps: {
      items: number;
      cols: Record<Breakpoint, number>;
    } = {
      items:
        filteredDashboards.length + (Object.keys(filteredFolders)?.length || 0),
      cols: { lg: 3, md: 3, sm: 3, xs: 3, xxs: 2 },
    };

    const [syncStorage, setSyncStorage] = useState(0);

    // Syncs storage to be up to date with onLayoutChange
    useEffect(() => {
      const updateLayouts = async () => {
        if (menuObject?.layouts) {
          await db.setItem("Menu_Object", menuObject);
        }
      };
      updateLayouts();
    }, [syncStorage]);

    // Checks if the Layout has changed, if so, updates the state and triggers the useEffect above
    const onLayoutChange = useCallback(
      (
        _layout: ReactGridLayout.Layout[],
        newLayouts: ReactGridLayout.Layouts,
      ) => {
        if (menuObject.currentFolder.length === 0) {
          if (!isEqual(menuObject?.layouts, newLayouts)) {
            setMenuObject((prevMenuObj) => {
              return {
                ...prevMenuObj,
                layouts: newLayouts,
              };
            });

            setSyncStorage((prev) => prev + 1);
          }
        } else {
          if (!isEqual(currentFolderObject.layouts, newLayouts)) {
            setMenuObject((prevMenuObj) => {
              const newMenuObj: MenuObject = JSON.parse(
                JSON.stringify(prevMenuObj),
              );
              // Find the folder we're in, and update its layouts
              const currentFolder = getCurrentFolder(newMenuObj);

              if (!currentFolder.layouts) {
                const folderContents = [
                  "MoveDashUpButton",
                  ...(Object.keys(currentFolder?.folders || {}) || []),
                  ...(currentFolder?.dashboards || []),
                ];
                currentFolder.layouts = generateLayouts(folderContents);
              } else {
                currentFolder.layouts = newLayouts;
              }

              return newMenuObj;
            });
            setSyncStorage((prev) => prev + 1);
          }
        }
      },
      [menuObject.currentFolder],
    );

    // Sets up the menu items, including both folders and dashboards
    const memoizedChildren = useMemo(() => {
      let keyIndex = 0;
      let xPosition = 0;
      let row = 0;
      let backButton: JSX.Element[] = [];

      if (menuObject.currentFolder.length !== 0) {
        const key = keyIndex;
        keyIndex += 1;
        backButton = [
          <button
            title={`Click to go up a level. Drag a Dashboard here to bring it up a level.`}
            key={key}
            data-up-folder={true}
            className="moveFolderUp"
            data-grid={{
              static: true,
              x: xPosition,
              y: row,
              w: 1,
              h: 1,
            }}
          >
            <img src={moveUp} alt="Move Up Icon" />
          </button>,
        ];

        xPosition += 1;
      }

      const folders = (Object.keys(filteredFolders) || []).map((folderName) => {
        const key = keyIndex;
        keyIndex += 1;

        const folderToReturn = (
          <div
            className="folder"
            key={key}
            data-folder={folderName}
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
                  y="14"
                  textLength="194"
                  lengthAdjust="spacingAndGlyphs"
                >
                  {folderName}
                </text>
              ) : (
                <text x="50%" y="14" style={{ textAnchor: "middle" }}>
                  {folderName}
                </text>
              )}
            </svg>
          </div>
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
            key={key}
          >
            <svg viewBox="0 0 194 18" style={{ width: "100%", height: "100%" }}>
              {dash.length >= 26 ? (
                <text
                  x="0"
                  y="14"
                  textLength="194"
                  lengthAdjust="spacingAndGlyphs"
                >
                  {dash}
                </text>
              ) : (
                <text x="50%" y="14" style={{ textAnchor: "middle" }}>
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
    }, [filteredDashboards, filteredFolders, menuObject.currentFolder]);

    // Whenever the folder list or layout changes in a way that might affect .folder elements:
    useEffect(() => {
      const currentFolders =
        document.querySelectorAll<HTMLDivElement>(".folder");

      folderRefs.current = Array.from(currentFolders);

      // Set the Current Folder
      const handleClick = (event: MouseEvent) => {
        const currentTarget = event.currentTarget as HTMLDivElement;
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = JSON.parse(
            JSON.stringify(prevMenuObj),
          );
          newMenuObj.currentFolder.push(currentTarget.textContent as string);
          return newMenuObj;
        });
        setSyncStorage((prev) => prev + 1);
      };

      folderRefs.current.forEach((folderRef) => {
        folderRef.addEventListener("click", handleClick);
      });

      return () => {
        folderRefs.current.forEach((folderRef) => {
          folderRef.removeEventListener("click", handleClick);
        });
      };
    }, [filteredFolders]);

    useEffect(() => {
      const folderUpBtn =
        document.querySelector<HTMLButtonElement>(".moveFolderUp");

      // Set the Current Folder
      const handleClick = () => {
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = JSON.parse(
            JSON.stringify(prevMenuObj),
          );
          newMenuObj.currentFolder.pop();
          return newMenuObj;
        });
        setSyncStorage((prev) => prev + 1);
      };

      if (folderUpBtn) {
        folderUpBtnRef.current = folderUpBtn as HTMLButtonElement;
        folderUpBtnRef.current.addEventListener("click", handleClick);
      }

      return () => {
        folderUpBtnRef.current &&
          folderUpBtnRef.current.removeEventListener("click", handleClick);
      };
    }, [filteredFolders]);

    const [mouseDownPos, setMouseDownPos] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // When item dragging begins, we notate where it started.
    const handleDragStart: ItemCallback = (
      _layout,
      _oldItem,
      _newItem,
      _placeholder,
      event,
    ) => {
      if (event.clientX && event.clientY) {
        setMouseDownPos({ x: event.clientX, y: event.clientY });
      } else if ((event as unknown as TouchEvent)?.touches) {
        const touchMoveEvent = event as unknown as TouchEvent;
        const touch = touchMoveEvent.touches[0];
        setMouseDownPos({ x: touch.clientX, y: touch.clientY });
      }
    };

    // As dragging occurs, if it's significant (more than a 5px change), then we consider the item is actually being dragged.
    const handleDrag: ItemCallback = (
      _layout,
      _oldItem,
      _newItem,
      _placeholder,
      event,
      element,
    ) => {
      if (!mouseDownPos) return;

      let mostOverlappedCollidable: HTMLElement | null = null;
      let highestOverlapArea = 0;

      let collidables: HTMLElement[] = folderRefs.current;

      if (folderUpBtnRef.current) {
        collidables = [...collidables, folderUpBtnRef.current];
      }

      // If a dashboard is colliding with a folder, do some logic.
      for (const el of collidables) {
        if (!el || !element) continue;
        const { overlapArea } = collisionInfo(element, el);
        if (overlapArea > highestOverlapArea) {
          highestOverlapArea = overlapArea;
          mostOverlappedCollidable = el;
        }
      }

      collidables.forEach((el) => {
        el.style.backgroundColor = "";
        el.style.borderColor = "";
        element.style.opacity = "1";
      });

      if (mostOverlappedCollidable) {
        element.style.opacity = "0.4";
        if (mostOverlappedCollidable.dataset.folder) {
          mostOverlappedCollidable.style.backgroundColor = "#fdb020";
        } else {
          mostOverlappedCollidable.style.borderColor = "#ffd579";
          // mostOverlappedCollidable.style.backgroundColor = "#ff9c9c";
        }
      }

      // If we're already dragging, we don't need to determine if we're dragging anymore
      if (isDragging) return;

      // Determine if we're dragging.
      let dx = 0;
      let dy = 0;
      const dragThreshold = 5;
      if (event.clientX && event.clientY) {
        dx = Math.abs(event.clientX - mouseDownPos.x);
        dy = Math.abs(event.clientY - mouseDownPos.y);
      } else if ((event as unknown as TouchEvent)?.touches) {
        const touchMoveEvent = event as unknown as TouchEvent;
        const touch = touchMoveEvent.touches[0];
        dx = Math.abs(touch.clientX - mouseDownPos.x);
        dy = Math.abs(touch.clientY - mouseDownPos.y);
      }

      if (dx > dragThreshold || dy > dragThreshold) {
        setIsDragging(true);
      }
    };

    const handleDragStop: ItemCallback = (
      _layout,
      _oldItem,
      _newItem,
      _placeholder,
      _event,
      element,
    ) => {
      setIsDragging(false);

      let collidables: HTMLElement[] = folderRefs.current;

      if (folderUpBtnRef.current) {
        collidables = [...collidables, folderUpBtnRef.current];
      }

      collidables.forEach((item) => {
        if (item) {
          item.style.backgroundColor = "";
          item.style.borderColor = "";
        }
        element.style.opacity = "1";
      });

      if (isDragging) {
        let mostOverlappedCollidable: HTMLElement | null = null;
        let highestOverlapArea = 0;

        for (const el of collidables) {
          if (!el) continue;
          const { overlapArea } = collisionInfo(element, el);
          if (overlapArea > highestOverlapArea) {
            highestOverlapArea = overlapArea;
            mostOverlappedCollidable = el;
          }
        }

        if (mostOverlappedCollidable) {
          const dashboardName = element.textContent as string;

          // Handle dragging a dash into a folder
          if (mostOverlappedCollidable.dataset.folder) {
            const folderName = mostOverlappedCollidable.textContent as string;
            setMenuObject((prevMenuObj) => {
              const newMenuObj: MenuObject = JSON.parse(
                JSON.stringify(prevMenuObj),
              );
              if (!folderName) return prevMenuObj;

              const currentFolder = getCurrentFolder(newMenuObj);

              // Make sure we've got a folders object
              if (!currentFolder?.folders) {
                currentFolder.folders = {};
              }

              // Make sure where the dash is headed has a dashboards array
              if (!currentFolder.folders[folderName].dashboards) {
                currentFolder.folders[folderName].dashboards = [];
              }

              // Add Dashboard to child folder
              currentFolder.folders?.[folderName || ""]?.dashboards?.push(
                dashboardName,
              );

              // Remove Dashboard from parent folder
              const indexOfDashboardsCurrentPosition =
                currentFolder?.dashboards?.indexOf(dashboardName);
              if (
                typeof indexOfDashboardsCurrentPosition === "number" &&
                indexOfDashboardsCurrentPosition > -1
              ) {
                currentFolder?.dashboards?.splice(
                  indexOfDashboardsCurrentPosition,
                  1,
                );
              }

              return newMenuObj;
            });

            // Handle moving a Dashboard up to its parent folder
          } else {
            setMenuObject((prevMenuObj) => {
              const newMenuObj: MenuObject = JSON.parse(
                JSON.stringify(prevMenuObj),
              );
              const {
                currentFolder,
                parentFolder,
              } = getSurroundings(newMenuObj);

              // Remove Dashboard from current folder
              const indexOfDashboardsCurrentPosition =
                currentFolder?.dashboards?.indexOf(dashboardName);
              if (
                typeof indexOfDashboardsCurrentPosition === "number" &&
                indexOfDashboardsCurrentPosition > -1
              ) {
                currentFolder?.dashboards?.splice(
                  indexOfDashboardsCurrentPosition,
                  1,
                );
              }

              // Add Dashboard to parent folder
              parentFolder.dashboards?.push(dashboardName);

              return newMenuObj;
            });
          }
        }
      } else {
        if (element?.dataset?.dash) {
          selectADashboard(element.dataset.dash);
        }
      }
    };

    return (
      menuObject?.layouts && (
        <>
          <ResponsiveReactGridLayout
            className="file-system"
            draggableCancel=".cancelDrag"
            {...gridProps}
            isDraggable={true}
            isResizable={false}
            rowHeight={40}
            layouts={currentFolderObject.layouts}
            onDragStop={handleDragStop}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onLayoutChange={onLayoutChange}
            style={{ width: "100%" }}
          >
            {memoizedChildren}
          </ResponsiveReactGridLayout>
        </>
      )
    );
  },
);

export default DashboardFileSystem;
