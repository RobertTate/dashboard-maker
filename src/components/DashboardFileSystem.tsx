import isEqual from "lodash.isequal";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactGridLayout, {
  type ItemCallback,
  Responsive,
  WidthProvider,
} from "react-grid-layout";

import db from "../dbInstance";
import { collisionInfo } from "../functions/collisions";
import { filterByFolder } from "../functions/filterByFolder";
import { generateLayouts } from "../functions/generateLayouts";
import {
  Breakpoint,
  DashboardFileSystemProps,
  Folder,
  MenuObject,
} from "../types";

const DashboardFileSystem = memo(
  ({
    dashBoardsArray,
    menuObject,
    selectADashboard,
    setMenuObject,
    refreshCount,
  }: DashboardFileSystemProps) => {
    if (!menuObject) return null;
    const folderRefs = useRef<HTMLDivElement[]>([]);
    const ResponsiveReactGridLayout = useMemo(
      () => WidthProvider(Responsive),
      [],
    );

    // Filter Out Dashboards that are not part of the current folder
    const myDashboards = useMemo(() => {
      return dashBoardsArray.filter((dash) => {
        if (dash === "Menu_Object") return false;
        const currentFolder = menuObject.currentFolder;

        if (currentFolder.length === 0) {
          return menuObject.dashboards.includes(dash);
        } else {
          return filterByFolder(dash, currentFolder, menuObject.folders);
        }
      });
    }, [
      dashBoardsArray,
      menuObject.folders,
      menuObject.currentFolder,
      menuObject.dashboards,
    ]);

    // Use gripProps for items and cols, as items is not typed correctly and cols is needed in two places
    const gridProps: {
      items: number;
      cols: Record<Breakpoint, number>;
    } = {
      items:
        myDashboards.length + (Object.keys(menuObject?.folders)?.length || 0),
      cols: { lg: 3, md: 3, sm: 3, xs: 3, xxs: 2 },
    };

    // Resets to the beginning layout if the refresh button is clicked
    useEffect(() => {
      if (refreshCount === 0) return;

      setMenuObject((prevMenuObj) => {
        const dashesAndFolders = [
          ...dashBoardsArray,
          ...(Object.keys(menuObject?.folders) || []),
        ] as string[];

        return {
          ...prevMenuObj,
          layouts: generateLayouts(dashesAndFolders),
        };
      });
    }, [refreshCount]);

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
        if (!isEqual(menuObject?.layouts, newLayouts)) {
          setMenuObject((prevMenuObj) => {
            return {
              ...prevMenuObj,
              layouts: newLayouts,
            };
          });

          setSyncStorage((prev) => prev + 1);
        }
      },
      [],
    );

    // Sets up the menu items, including both folders and dashboards
    const memoizedChildren = useMemo(() => {
      let keyIndex = 0;
      let xPosition = 0;
      let row = 0;

      const folders = (Object.keys(menuObject?.folders) || []).map(
        (folderName) => {
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
              <svg viewBox="0 0 194 18">
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
        },
      );

      const dashboards = myDashboards.map((dash) => {
        const key = keyIndex;
        keyIndex += 1;

        const dashboardToReturn = (
          <button
            title={`Click to view and edit this dashboard.`}
            data-dash={dash}
            key={key}
          >
            <svg viewBox="0 0 194 18">
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

      return [...folders, ...dashboards];
    }, [myDashboards, menuObject.folders]);

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
      };

      folderRefs.current.forEach((folderRef) => {
        folderRef.addEventListener("click", handleClick);
      });

      return () => {
        folderRefs.current.forEach((folderRef) => {
          folderRef.removeEventListener("click", handleClick);
        });
      };
    }, [menuObject.folders]);

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

      let mostOverlappedFolder: HTMLDivElement | null = null;
      let highestOverlapArea = 0;
      // If a dashboard is colliding with a folder, do some logic.
      for (const folderEl of folderRefs.current) {
        if (!folderEl || !element) continue;
        const { overlapArea } = collisionInfo(element, folderEl);
        if (overlapArea > highestOverlapArea) {
          highestOverlapArea = overlapArea;
          mostOverlappedFolder = folderEl;
        }
      }

      folderRefs.current.forEach((folderEl) => {
        folderEl.style.backgroundColor = "";
        element.style.opacity = "1";
      });

      if (mostOverlappedFolder) {
        mostOverlappedFolder.style.backgroundColor = "#fdb020";
        element.style.opacity = "0.4";
      }

      if (isDragging) return;
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

    // If we were dragging an item around, we don't act as if we clicked/selected it.
    // If we were NOT dragging an item around, we treat it like it was a click, and select that dashboard.
    const handleDragStop: ItemCallback = (
      _layout,
      _oldItem,
      _newItem,
      _placeholder,
      _event,
      element,
    ) => {
      setIsDragging(false);

      folderRefs.current.forEach((f) => {
        if (f) f.style.backgroundColor = "";
        element.style.opacity = "1";
      });

      if (isDragging) {
        let mostOverlappedFolder: HTMLDivElement | null = null;
        let highestOverlapArea = 0;

        for (const folderEl of folderRefs.current) {
          if (!folderEl) continue;
          const { overlapArea } = collisionInfo(element, folderEl);
          if (overlapArea > highestOverlapArea) {
            highestOverlapArea = overlapArea;
            mostOverlappedFolder = folderEl;
          }
        }

        if (mostOverlappedFolder) {
          console.log(
            `${element.textContent} was dropped into the ${mostOverlappedFolder.textContent} folder!`,
          );
          // Do the logic of moving a dashboard into a folder here.
          setMenuObject((prevMenuObj) => {
            const newMenuObj: MenuObject = JSON.parse(
              JSON.stringify(prevMenuObj),
            );
            if (menuObject.currentFolder.length === 0) {
              mostOverlappedFolder?.textContent &&
                newMenuObj.folders?.[
                  mostOverlappedFolder?.textContent || ""
                ]?.dashboards?.push(element.textContent as string);

              const indexOfDashboardsCurrentPosition =
                newMenuObj?.dashboards?.indexOf(element.textContent as string);
              if (indexOfDashboardsCurrentPosition > -1) {
                newMenuObj?.dashboards?.splice(
                  indexOfDashboardsCurrentPosition,
                  1,
                );
              }
            } else {
              let finalFolder: Folder = {};
              const currentInd = menuObject.currentFolder;
              for (let i = 0; i < currentInd.length; i++) {
                if (i === 0) {
                  finalFolder = menuObject?.folders?.[currentInd[i]];
                } else {
                  finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
                }
              }
              mostOverlappedFolder?.textContent &&
                finalFolder?.folders?.[
                  mostOverlappedFolder.textContent || ""
                ]?.dashboards?.push(element.textContent as string);
              const indexOfDashboardsCurrentPosition =
                finalFolder?.dashboards?.indexOf(element.textContent as string);
              if (
                typeof indexOfDashboardsCurrentPosition === "number" &&
                indexOfDashboardsCurrentPosition > -1
              ) {
                finalFolder?.dashboards?.splice(
                  indexOfDashboardsCurrentPosition,
                  1,
                );
              }
            }

            return newMenuObj;
          });
        }
      } else {
        if (element?.dataset?.dash) {
          selectADashboard(element.dataset.dash);
        }
      }
    };

    return (
      menuObject?.layouts &&
      memoizedChildren && (
        <>
          <ResponsiveReactGridLayout
            className="file-system"
            draggableCancel=".cancelDrag"
            {...gridProps}
            isDraggable={true}
            isResizable={false}
            rowHeight={40}
            layouts={menuObject.layouts}
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
