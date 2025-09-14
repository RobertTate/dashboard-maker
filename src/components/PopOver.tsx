import { memo, useCallback, useRef, useState } from "react";

import DashboardIcon from "../assets/dashboard.svg?react";
import RefreshIcon from "../assets/refresh.svg?react";
import UploadIcon from "../assets/upload.svg?react";
import db from "../dbInstance";
import { getCurrentFolder, validateUpload } from "../functions";
import {
  useAppStore,
  useInitDashboards,
  useReceiveDashboard,
  useShowDiceResults,
  useSyncStorage,
} from "../functions/hooks";
import styles from "../styles/PopOver.module.css";
import type {
  DashboardItemsProps,
  MenuObject,
  NewDashboardTemplateOptions,
  PopOverProps,
} from "../types/index.ts";
import Dashboard from "./Dashboard";
import DashboardFileSystem from "./DashboardFileSystem.tsx";
import { FolderCreator } from "./FolderCreator";
import { InfoMenu } from "./InfoMenu.tsx";

const PopOver = memo(({ standalone = false, role }: PopOverProps) => {
  const { selectedDashboard, selectADashboard } = useAppStore();

  const [dashBoardsArray, setDashboardsArray] = useState<string[]>([]);
  const [menuObject, setMenuObject] = useState<MenuObject>({
    folders: {},
    dashboards: [],
    currentFolder: [],
  });
  const [refreshCount, setRefreshCount] = useState(0);
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const [syncStorage, setSyncStorage] = useState(0);
  useSyncStorage(syncStorage, menuObject);

  useReceiveDashboard(
    standalone,
    setRefreshCount,
    selectADashboard,
    setMenuObject,
  );
  useShowDiceResults(standalone);
  useInitDashboards(refreshCount, setDashboardsArray, setMenuObject);

  const updateDashboardsState = useCallback(
    (dashName: string, type: "add" | "remove") => {
      switch (type) {
        case "add":
          setDashboardsArray((prev) => [...prev, dashName]);
          break;
        case "remove":
          setDashboardsArray((prev) => {
            return prev.filter((d) => d !== dashName);
          });
      }
    },
    [],
  );

  const deleteADashboard = useCallback(
    async (dashName: string) => {
      await db.removeItem(dashName);
      updateDashboardsState(dashName, "remove");

      setMenuObject((prevMenuObj) => {
        const newMenuObj: MenuObject = structuredClone(prevMenuObj);
        const currentFolder = getCurrentFolder(newMenuObj);
        if (!currentFolder?.dashboards) {
          currentFolder.dashboards = [];
        }
        const dashIndex = currentFolder?.dashboards?.indexOf(dashName);
        if (dashIndex > -1) {
          currentFolder?.dashboards?.splice(dashIndex, 1);
        }
        return newMenuObj;
      });

      selectADashboard("");
    },
    [selectADashboard, updateDashboardsState],
  );

  const createADashboard = useCallback(
    async (
      template: NewDashboardTemplateOptions,
      duplicateDashInputRef?: React.RefObject<HTMLInputElement>,
      contentToDuplicate?: DashboardItemsProps,
    ) => {
      const keys = await db.keys();
      const inputRefInUse = duplicateDashInputRef
        ? duplicateDashInputRef
        : newDashInputRef;
      const dashName = inputRefInUse?.current!.value;
      if (dashName) {
        if (keys.includes(dashName)) {
          const inputResponse =
            dashName === "Menu_Object"
              ? "Don't call it that! I'm using that for something under the hood."
              : "The Dashboard Name Must Be Unique.";
          inputRefInUse!.current!.setCustomValidity(inputResponse);
          inputRefInUse!.current!.reportValidity();
        } else {
          if (template === "5eChar") {
            const fifthEditionCharTemplate = await import(
              "../partials/fifthEditionCharTemplate.ts"
            );
            await db.setItem(dashName, fifthEditionCharTemplate.default);
          } else if (template === "duplicate") {
            await db.setItem(dashName, contentToDuplicate);
          } else {
            await db.setItem(dashName, {});
          }
          updateDashboardsState(dashName, "add");

          // add the dashboard to the correct folder.
          setMenuObject((prevMenuObj) => {
            const newMenuObj: MenuObject = structuredClone(prevMenuObj);
            const currentFolder = getCurrentFolder(newMenuObj);
            if (!currentFolder?.dashboards) {
              currentFolder.dashboards = [];
            }
            currentFolder.dashboards.push(dashName);
            return newMenuObj;
          });

          if (duplicateDashInputRef) {
            selectADashboard("");
          }
        }
      } else {
        inputRefInUse!.current!.setCustomValidity(
          "The Dashboard Name Cannot Be Blank.",
        );
        inputRefInUse!.current!.reportValidity();
      }
    },
    [selectADashboard, updateDashboardsState],
  );

  const handleUploadClick = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const dashboardName = file.name.replace(".json", "");
      if (dashBoardsArray.includes(dashboardName)) {
        uploadRef!.current!.setCustomValidity("");
        uploadRef!.current!.setCustomValidity(
          "The Dashboard Name Must Be Unique. Rename the file!",
        );
        uploadRef!.current!.reportValidity();
        event.target.value = "";
      } else {
        uploadRef!.current!.setCustomValidity("");
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target && e.target.result;
          try {
            const uploadedDashboard: DashboardItemsProps = JSON.parse(
              text as string,
            );
            const isValidDashboard = validateUpload(uploadedDashboard);
            if (isValidDashboard) {
              await db.setItem(dashboardName, uploadedDashboard);
              updateDashboardsState(dashboardName, "add");
              setMenuObject((prevMenuObj) => {
                const newMenuObj: MenuObject = structuredClone(prevMenuObj);
                const currentFolder = getCurrentFolder(newMenuObj);

                if (!currentFolder.dashboards) {
                  currentFolder.dashboards = [];
                }

                currentFolder.dashboards.push(dashboardName);

                return newMenuObj;
              });
            } else {
              uploadRef!.current!.setCustomValidity("");
              uploadRef!.current!.setCustomValidity("Invalid Dashboard File!");
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
            uploadRef!.current!.setCustomValidity("");
            uploadRef!.current!.setCustomValidity("Error Reading the file.");
          } finally {
            uploadRef!.current!.reportValidity();
            event.target.value = "";
          }
        };
        reader.onerror = () => {
          // To debug, check for reader.error
          uploadRef!.current!.setCustomValidity("");
          uploadRef!.current!.setCustomValidity("Error Uploading the file.");
          uploadRef!.current!.reportValidity();
          event.target.value = "";
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <main className={styles["pop-over"]}>
      {selectedDashboard ? (
        <Dashboard
          deleteADashboard={deleteADashboard}
          createADashboard={createADashboard}
          standalone={standalone}
          role={role}
        />
      ) : (
        <>
          <h1>
            <DashboardIcon
              className="icon-svg-logo"
              style={{
                width: "44px",
                top: "4px",
                position: "relative"
              }}
              />
            Dashboard Maker
          </h1>
          <h3>GM Screens, Character Sheets, and Whatever Else.</h3>
          <InfoMenu />
          <div className={styles["dashboard-creator"]}>
            <div className={styles["dashboard-input"]}>
              <button
                className="icon-button"
                title="Refresh the app. Reorder your dashboards. Keep things in sync. Feel in control."
                onClick={() => setRefreshCount((prev) => prev + 1)}
                id="refresh-button"
              >
                <RefreshIcon
                  className="icon-svg"
                  style={{
                    width: "20px"
                  }}
                />
              </button>
              <input
                type="file"
                accept=".json"
                ref={uploadRef}
                onChange={handleUpload}
                style={{
                  opacity: 0,
                  position: "absolute",
                  zIndex: -1,
                }}
              />
              <button
                className="icon-button"
                id="upload-button"
                title="Upload a Dashboard."
                onClick={() => handleUploadClick()}
              >
                <UploadIcon
                  className="icon-svg"
                  style={{
                    width: "20px"
                  }}
                />
              </button>
              <input
                ref={newDashInputRef}
                type="text"
                name="dashboardName"
                placeholder="Add Dashboard Name Here"
                required
                title="Enter your new dashboard name here, then click one of the two options below."
                style={{ paddingLeft: "4px" }}
              />
            </div>
            <div className={styles["dashboard-input-selections"]}>
              <button
                onClick={() => createADashboard("default")}
                title="Create a new empty dashboard."
              >
                <svg viewBox="0 0 187 16">
                  <text
                    x="50%"
                    y="14"
                    lengthAdjust="spacingAndGlyphs"
                    style={{ textAnchor: "middle", fontWeight: "400" }}
                  >
                    Create New Dashboard
                  </text>
                </svg>
              </button>
              <button
                onClick={() => createADashboard("5eChar")}
                title="Create a new dashboard using a 5e Character Template."
              >
                <svg viewBox="0 0 197 16">
                  <text
                    x="50%"
                    y="14"
                    lengthAdjust="spacingAndGlyphs"
                    style={{ textAnchor: "middle", fontWeight: "400" }}
                  >
                    Create New 5e Character
                  </text>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <FolderCreator
              menuObject={menuObject}
              setMenuObject={setMenuObject}
              setSyncStorage={setSyncStorage}
            />
            <DashboardFileSystem
              dashBoardsArray={dashBoardsArray}
              menuObject={menuObject}
              setMenuObject={setMenuObject}
              setSyncStorage={setSyncStorage}
            />
          </div>
          <div className={styles["premade-dashboards"]}></div>
        </>
      )}
    </main>
  );
});

PopOver.displayName = "PopOver";

export default PopOver;
