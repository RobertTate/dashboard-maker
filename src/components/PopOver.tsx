import OBR from "@owlbear-rodeo/sdk";
import pako from "pako";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import dashboard from "../assets/dashboard.svg";
import refresh from "../assets/refresh.svg";
import upload from "../assets/upload.svg";
import db from "../dbInstance";
import { getCurrentFolder } from "../functions/folderFunctions.ts";
import { generateLayouts } from "../functions/generateLayouts.ts";
import validateUpload from "../functions/validateUpload.ts";
import styles from "../styles/PopOver.module.css";
import type {
  DashboardItemsProps,
  Folder,
  MenuObject,
  NewDashboardTemplateOptions,
  PopOverProps,
  PremadeDashConfig,
  RollBroadcast,
  SharedDashboard,
} from "../types/index.ts";
import Dashboard from "./Dashboard";
import DashboardFileSystem from "./DashboardFileSystem.tsx";
import { FolderCreator } from "./FolderCreator";

async function addPremade(premade: PremadeDashConfig) {
  const premadeContent = await import(`../partials/${premade.fileName}.ts`);
  await db.setItem(premade.dashName, premadeContent.default);
  return premade.dashName;
}

async function checkAndAddPremades(keys: string[]) {
  const premadesArrayToCheckAgainst: PremadeDashConfig[] = [
    {
      fileName: "armorDashPremade",
      dashName: "⭐ Armor ⭐",
    },
    {
      fileName: "simpleWeaponsDashPremade",
      dashName: "⭐ Simple Weapons ⭐",
    },
    {
      fileName: "martialWeaponsDashPremade",
      dashName: "⭐ Martial Weapons ⭐",
    },
    {
      fileName: "adventuringGearDashPremade",
      dashName: "⭐ Adventuring Gear ⭐",
    },
    {
      fileName: "conditionsDashPremade",
      dashName: "⭐ Conditions ⭐",
    },
    {
      fileName: "skillsDashPremade",
      dashName: "⭐ Skills ⭐",
    },
    {
      fileName: "diceDemoPremade",
      dashName: "⭐ Dice Demo ⭐",
    },
    {
      fileName: "devNotePremade",
      dashName: "⭐ Developer Note ⭐",
    },
  ];

  const promises: Promise<string>[] = [];

  premadesArrayToCheckAgainst.forEach((premade) => {
    if (!keys.includes(premade.dashName)) {
      promises.push(addPremade(premade));
    }
  });

  const newPremades = await Promise.all(promises);

  return newPremades;
}

const PopOver = memo(({ standalone = false, role }: PopOverProps) => {
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [dashBoardsArray, setDashboardsArray] = useState<string[]>([]);
  const [menuObject, setMenuObject] = useState<MenuObject>({
    folders: {},
    dashboards: [],
    currentFolder: [],
  });
  const [refreshCount, setRefreshCount] = useState(0);
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const selectADashboard = useCallback((dashName: string) => {
    setSelectedDashboard(dashName);
  }, []);

  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker",
        async (event) => {
          try {
            const b64EncodedCompressedUint8ArrayString = event?.data as string;
            const compressedUint8ArrayString = atob(
              b64EncodedCompressedUint8ArrayString,
            );
            const compressedUint8Array = new Uint8Array(
              compressedUint8ArrayString.length,
            );
            for (let i = 0; i < compressedUint8ArrayString.length; i++) {
              compressedUint8Array[i] =
                compressedUint8ArrayString.charCodeAt(i);
            }
            const stringified = pako.ungzip(compressedUint8Array, {
              to: "string",
            });
            const sharedDashboard: SharedDashboard = JSON.parse(stringified);
            const { sharedDashboardTitle, sharedDashboardContent } =
              sharedDashboard;
            await db.setItem(sharedDashboardTitle, sharedDashboardContent);
            setRefreshCount((prev) => prev + 1);
            selectADashboard("");
            await OBR.notification.show(
              `"${sharedDashboardTitle}" has just been shared with you!`,
              "SUCCESS",
            );
          } catch (e) {
            console.error(e);
            await OBR.notification.show("Dashboard Sharing Failed.", "ERROR");
          }
        },
      );
    }
  }, []);

  useEffect(() => {
    if (standalone === false) {
      return OBR.broadcast.onMessage(
        "com.roberttate.dashboard-maker-dice-notification",
        async (event) => {
          try {
            const rollBroadcast = event?.data as RollBroadcast;
            const { playerName, rollResult } = rollBroadcast;
            await OBR.notification.show(
              `${playerName} rolled a ${rollResult}`,
              "SUCCESS",
            );
          } catch (e) {
            await OBR.notification.show("Something went wrong.", "ERROR");
          }
        },
      );
    }
  }, []);

  useEffect(() => {
    const initDashboards = async () => {
      let keys = await db.keys();
      const premades = await checkAndAddPremades(keys);
      if (premades.length > 0) {
        keys = [...keys, ...premades];
      }
      setDashboardsArray(keys);

      if (refreshCount > 0) {
        setMenuObject((prevMenuObj) => {
          const newMenuObj: MenuObject = JSON.parse(
            JSON.stringify(prevMenuObj),
          );
          const currentInd = newMenuObj?.currentFolder;

          if (!newMenuObj.folders) {
            newMenuObj.folders = {};
          }

          newMenuObj.folders["5th Edition D&D"] = {
            dashboards: [
              ...(newMenuObj.folders["5th Edition D&D"]?.dashboards || []),
              ...premades,
            ],
          };

          if (currentInd.length === 0) {
            newMenuObj.layouts = generateLayouts([
              ...(Object.keys(newMenuObj.folders || {}) || []),
              ...(newMenuObj.dashboards || []),
            ]);
          } else {
            const currentFolder = getCurrentFolder(newMenuObj);
            currentFolder.layouts = generateLayouts([
              "MoveDashUpButton",
              ...(Object.keys(currentFolder.folders || {}) || []),
              ...(currentFolder.dashboards || []),
            ]);
          }

          return newMenuObj;
        });
      } else {
        if (keys.includes("Menu_Object")) {
          const storedMenu = (await db.getItem("Menu_Object")) as MenuObject;
          const storedMenuToPass: MenuObject = {
            ...storedMenu,
            folders: {
              ...storedMenu.folders,
              "5th Edition D&D": {
                dashboards: [
                  ...(storedMenu?.folders?.["5th Edition D&D"]?.dashboards ||
                    []),
                  ...premades,
                ],
              },
            },
          };
          setMenuObject(storedMenuToPass);
        } else {
          const startingMenuLayouts = generateLayouts([
            ...keys,
            "5th Edition D&D",
          ]);

          const startingMenu = {
            layouts: startingMenuLayouts,
            currentFolder: [],
            folders: {
              "5th Edition D&D": {
                dashboards: [...keys.filter((key) => key.includes("⭐"))],
              },
            },
            dashboards: [...keys.filter((key) => !key.includes("⭐"))],
          };

          setMenuObject(startingMenu);
        }
      }
    };
    initDashboards();
  }, [refreshCount]);

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

  const deleteADashboard = useCallback(async (dashName: string) => {
    await db.removeItem(dashName);
    updateDashboardsState(dashName, "remove");

    // remove the folders reference to the dashboard.
    setMenuObject((prevMenuObj) => {
      const newMenuObj: MenuObject = JSON.parse(JSON.stringify(prevMenuObj));
      let finalFolder: Folder = {};
      const currentInd = newMenuObj.currentFolder;

      if (currentInd.length === 0) {
        const dashIndex = newMenuObj?.dashboards?.indexOf(dashName);
        if (dashIndex > -1) {
          newMenuObj?.dashboards?.splice(dashIndex, 1);
        }
      } else {
        for (let i = 0; i < currentInd.length; i++) {
          if (i === 0) {
            finalFolder = newMenuObj?.folders?.[currentInd[i]];
          } else {
            finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
          }
        }

        if (!finalFolder?.dashboards) {
          finalFolder.dashboards = [];
        }

        const dashIndex = finalFolder?.dashboards?.indexOf(dashName);
        if (dashIndex > -1) {
          finalFolder?.dashboards?.splice(dashIndex, 1);
        }
      }

      return newMenuObj;
    });

    selectADashboard("");
  }, []);

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
            const newMenuObj: MenuObject = JSON.parse(
              JSON.stringify(prevMenuObj),
            );
            let finalFolder: Folder = {};
            const currentInd = newMenuObj.currentFolder;

            if (currentInd.length === 0) {
              newMenuObj.dashboards.push(dashName);
            } else {
              for (let i = 0; i < currentInd.length; i++) {
                if (i === 0) {
                  finalFolder = newMenuObj?.folders?.[currentInd[i]];
                } else {
                  finalFolder = finalFolder?.folders?.[currentInd[i]] as Folder;
                }
              }

              if (!finalFolder?.dashboards) {
                finalFolder.dashboards = [];
              }

              finalFolder.dashboards.push(dashName);
            }

            return newMenuObj;
          });

          if (duplicateDashInputRef) {
            selectADashboard("");
          } else {
            selectADashboard(dashName);
          }
        }
      } else {
        inputRefInUse!.current!.setCustomValidity(
          "The Dashboard Name Cannot Be Blank.",
        );
        inputRefInUse!.current!.reportValidity();
      }
    },
    [],
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
                const newMenuObj: MenuObject = JSON.parse(
                  JSON.stringify(prevMenuObj),
                );
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
          } catch (error) {
            console.error("Error parsing JSON:", error);
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
          selectADashboard={selectADashboard}
          createADashboard={createADashboard}
          selectedDashboard={selectedDashboard}
          standalone={standalone}
          role={role}
        />
      ) : (
        <>
          <h1>
            <img
              id="headingImage"
              alt="Dashboard Maker Logo"
              src={dashboard}
            ></img>
            Dashboard Maker
          </h1>
          <h3>DM Screens, Character Sheets, and Whatever Else.</h3>
          <div className={styles["dashboard-creator"]}>
            <div className={styles["dashboard-input"]}>
              <button
                className="icon-button"
                title="Refresh the app. Reorder your dashboards. Keep things in sync. Feel in control."
                onClick={() => setRefreshCount((prev) => prev + 1)}
                id="refresh-button"
              >
                <img style={{ width: "20px" }} src={refresh} alt="Refresh" />
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
                title="Upload A Dashboard."
                onClick={() => handleUploadClick()}
              >
                <img style={{ width: "20px" }} src={upload} alt="Upload" />
              </button>
              <input
                ref={newDashInputRef}
                type="text"
                name="dashboardName"
                placeholder="Add Dashboard Name Here"
                required
                title="Enter your new dashboard name here, then click one of the two options below."
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
                    style={{ textAnchor: "middle" }}
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
                    style={{ textAnchor: "middle" }}
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
            />
            <DashboardFileSystem
              dashBoardsArray={dashBoardsArray}
              menuObject={menuObject}
              setMenuObject={setMenuObject}
              selectADashboard={selectADashboard}
              refreshCount={refreshCount}
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
