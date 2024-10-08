import OBR from "@owlbear-rodeo/sdk";
import pako from "pako";
import { useCallback, useEffect, useRef, useState, memo } from "react";

import dashboard from "../assets/dashboard.svg";
import refresh from "../assets/refresh.svg";
import upload from "../assets/upload.svg";
import db from "../dbInstance";
import validateUpload from "../functions/validateUpload.ts";
import styles from "../styles/PopOver.module.css";
import type {
  DashboardItemsProps,
  NewDashboardTemplateOptions,
  PopOverProps,
  PremadeDashConfig,
  SharedDashboard,
  RollBroadcast,
} from "../types/index.ts";
import Dashboard from "./Dashboard";

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
  const [refreshCount, setRefreshCount] = useState(0);
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

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
          } catch(e) {
            await OBR.notification.show("Something went wrong.", "ERROR");
          }
        },
      );
    }
  },[]);

  useEffect(() => {
    const initDashboards = async () => {
      let keys = await db.keys();
      const premades = await checkAndAddPremades(keys);
      if (premades.length > 0) {
        keys = [...keys, ...premades];
      }
      setDashboardsArray(keys);
    };

    initDashboards();
  }, [refreshCount]);

  const selectADashboard = useCallback((dashName: string) => {
    setSelectedDashboard(dashName);
  }, []);

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
          inputRefInUse!.current!.setCustomValidity(
            "The Dashboard Name Must Be Unique.",
          );
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
                title="Refresh the app. Keep things in sync. Feel in control."
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
                <img style={{ width: "20px" }} src={upload} alt="Refresh" />
              </button>
              <input
                ref={newDashInputRef}
                type="text"
                name="dashboardName"
                required
                title="Enter your new dashboard name here."
              />
            </div>
            <button
              onClick={() => createADashboard("default")}
              title="Create a new empty dashboard."
            >
              <h3>Create New Dashboard</h3>
            </button>
            <button
              onClick={() => createADashboard("5eChar")}
              id="fifth-edition-char"
              title="Create a new dashboard using a 5e Character Template."
            >
              <h3>Create New 5e Character</h3>
            </button>
          </div>
          <div>
            <p>My Dashboards:</p>
            {dashBoardsArray
              .filter((dash) => !dash.startsWith("⭐"))
              .map((dash, index) => {
                return (
                  <button
                    title={`Click to view and edit this dashboard.`}
                    key={`${dash}-${index}`}
                    onClick={() => selectADashboard(dash)}
                  >
                    <p>{dash}</p>
                  </button>
                );
              })}
          </div>
          <div className={styles["premade-dashboards"]}>
            <p>Premade 5e Dashboards:</p>
            {dashBoardsArray
              .filter((dash) => dash.startsWith("⭐"))
              .map((dash, index) => {
                return (
                  <button
                    title={`View and edit the ${dash} premade dashboard.`}
                    key={`${dash}-${index}`}
                    onClick={() => selectADashboard(dash)}
                  >
                    <p>{dash}</p>
                  </button>
                );
              })}
            <p>
              <em>
                (If any Premade Dashboards are deleted, just hit refresh above
                to get a new one.)
              </em>
            </p>
          </div>
        </>
      )}
    </main>
  );
});

PopOver.displayName = "PopOver";

export default PopOver;
