import { useCallback, useEffect, useRef, useState } from "react";

import dashboard from "../assets/dashboard.svg";
import refresh from "../assets/refresh.svg";
import upload from "../assets/upload.svg";
import db from "../dbInstance";
import validateUpload from "../functions/validateUpload.ts";
import styles from "../styles/PopOver.module.css";
import type {
  DashboardItemsProps,
  NewDashboardTemplateOptions,
  PremadeDashConfig,
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

export default function PopOver() {
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [dashBoardsArray, setDashboardsArray] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

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
          <button
            className="icon-button"
            title="Refresh the app. Keep things in sync. Feel in control."
            onClick={() => setRefreshCount((prev) => prev + 1)}
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
            title="Upload A Dashboard."
            onClick={() => handleUploadClick()}
          >
            <img style={{ width: "20px" }} src={upload} alt="Refresh" />
          </button>
          <div className={styles["dashboard-creator"]}>
            <input
              ref={newDashInputRef}
              type="text"
              name="dashboardName"
              required
            />
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
          <div>
            <p>Premade Dashboards:</p>
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
                (If any Premade Dashboards Are Deleted...Don't Worry. Just hit
                refresh above and you'll get a new one.)
              </em>
            </p>
          </div>
        </>
      )}
    </main>
  );
}
