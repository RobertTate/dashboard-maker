import isEqual from "lodash.isequal";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import ReactGridLayout, {
  type ItemCallback,
  Responsive,
  WidthProvider,
} from "react-grid-layout";

import { RESERVED_DB_KEYS } from "../constants/dbKeys";
import {
  collisionInfo,
  generateLayouts,
  getCurrentFolder,
  getSurroundings,
} from "../functions";
import {
  useAppStore,
  useCreateMenuItems,
  useFixLayout,
} from "../functions/hooks";
import { Breakpoint, DashboardFileSystemProps, MenuObject } from "../types";

const DashboardFileSystem = memo(
  ({
    dashBoardsArray,
    menuObject,
    setMenuObject,
    setSyncStorage,
  }: DashboardFileSystemProps) => {
    const { selectADashboard } = useAppStore();
    // Drop targets for dashboard drags (folders + the move-up button).
    // Snapshotted once per drag in handleDragStart. Collected via a DOM
    // query rather than refs because react-grid-layout clones its children
    // with its own ref, discarding any ref we set on them.
    const collidablesRef = useRef<HTMLElement[]>([]);
    const ResponsiveReactGridLayout = useMemo(
      () => WidthProvider(Responsive),
      [],
    );

    const onFolderClick = useCallback(
      (folderName: string) => {
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = structuredClone(prevMenuObj);
          newMenuObj.currentFolder.push(folderName);
          return newMenuObj;
        });
        setSyncStorage((prev) => prev + 1);
      },
      [setMenuObject, setSyncStorage],
    );

    const onMoveUpClick = useCallback(() => {
      setMenuObject((prevMenuObj) => {
        const newMenuObj: MenuObject = structuredClone(prevMenuObj);
        newMenuObj.currentFolder.pop();
        return newMenuObj;
      });
      setSyncStorage((prev) => prev + 1);
    }, [setMenuObject, setSyncStorage]);

    const currentFolderObject = useMemo(() => {
      return getCurrentFolder(menuObject);
    }, [menuObject]);

    useFixLayout(currentFolderObject, setMenuObject);

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
        if (RESERVED_DB_KEYS.includes(dash)) return false;
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

    // Checks if the Layout has changed, if so, updates the state and triggers a DB sync
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
              const newMenuObj: MenuObject = structuredClone(prevMenuObj);
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
      [
        menuObject.currentFolder,
        currentFolderObject.layouts,
        menuObject?.layouts,
        setMenuObject,
        setSyncStorage,
      ],
    );

    // Sets up the menu items, including both folders and dashboards
    const memoizedChildren = useCreateMenuItems(
      menuObject,
      filteredFolders,
      filteredDashboards,
      { onFolderClick, onMoveUpClick },
    );

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
      collidablesRef.current = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-folder], [data-up-folder]",
        ),
      );
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

      const collidables = collidablesRef.current;

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

      const collidables = collidablesRef.current;

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

        const dashboardName = element.dataset.dash;
        if (mostOverlappedCollidable && dashboardName) {
          // Handle dragging a dash into a folder
          if (mostOverlappedCollidable.dataset.folder) {
            const folderName = mostOverlappedCollidable.dataset.folder;
            setMenuObject((prevMenuObj) => {
              const newMenuObj: MenuObject = structuredClone(prevMenuObj);
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
              const newMenuObj: MenuObject = structuredClone(prevMenuObj);
              const { currentFolder, parentFolder } =
                getSurroundings(newMenuObj);

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
              if (!parentFolder.dashboards) {
                parentFolder.dashboards = [];
              }
              parentFolder.dashboards.push(dashboardName);

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

    if (menuObject) {
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
    } else {
      return null;
    }
  },
);

export default DashboardFileSystem;
