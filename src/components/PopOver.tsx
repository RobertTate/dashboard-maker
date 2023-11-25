import localforage from "localforage";
import { useEffect, useState, useCallback, useRef } from "react";
import Dashboard from "./Dashboard";
import styles from "../styles/PopOver.module.css";
import refresh from "../assets/refresh.svg";
import dashboard from "../assets/dashboard.svg";

type PremadeIdentifier = {
  fileName: string;
  dashName: string;
};

type DashboardPreset = "default" | "5eChar";

async function addPremade(premade: PremadeIdentifier) {
  const premadeContent = await import(`../partials/${premade.fileName}.ts`);
  await localforage.setItem(premade.dashName, premadeContent.default);
  return premade.dashName;
}

async function checkAndAddPremades(keys: string[]) {
  const premadesArrayToCheckAgainst = [
    {
      fileName: "armorDashPremade",
      dashName: "⭐ Armor ⭐",
    },
    {
      fileName: "simpleWeaponsDashPremade",
      dashName: "⭐ Simple Weapons ⭐",
    },
  ];

  const promises: Promise<string>[] = [];

  premadesArrayToCheckAgainst.forEach((premade: PremadeIdentifier) => {
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
  const newDashInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initDashboards = async () => {
      let keys = await localforage.keys();
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
    const shouldDelete = window.prompt(
      "Type DELETE to delete this Dashboard Permanently.",
    );
    if (String(shouldDelete) === "DELETE") {
      await localforage.removeItem(dashName);
      updateDashboardsState(dashName, "remove");
      selectADashboard("");
    }
  }, []);

  const createADashboard = async (preset: DashboardPreset) => {
    const keys = await localforage.keys();
    const dashName = newDashInput?.current!.value;
    if (dashName) {
      if (keys.includes(dashName)) {
        newDashInput!.current!.setCustomValidity(
          "The Dashboard Name Must Be Unique.",
        );
        newDashInput!.current!.reportValidity();
      } else {
        if (preset === "5eChar") {
          const fifthEditionCharTemplate = await import(
            "../partials/fifthEditionCharTemplate.ts"
          );
          await localforage.setItem(dashName, fifthEditionCharTemplate.default);
        } else {
          await localforage.setItem(dashName, {});
        }
        updateDashboardsState(dashName, "add");
        selectADashboard(dashName);
      }
    } else {
      newDashInput!.current!.setCustomValidity(
        "The Dashboard Name Cannot Be Blank.",
      );
      newDashInput!.current!.reportValidity();
    }
  };

  return (
    <main className={styles.popOver}>
      {selectedDashboard ? (
        <Dashboard
          deleteADashboard={deleteADashboard}
          selectADashboard={selectADashboard}
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
            className="iconButton"
            title="Refresh the app. Keep things in sync. Feel in control."
            onClick={() => setRefreshCount((prev) => prev + 1)}
          >
            <img style={{ width: "20px" }} src={refresh} alt="Refresh" />
          </button>
          <div className={styles.dashBoardCreator}>
            <input
              ref={newDashInput}
              type="text"
              name="dashboardName"
              required
            />
            <button
              onClick={() => createADashboard("default")}
              title="Create a new empty dashboard."
            >
              <h3>Create A New Dashboard</h3>
            </button>
            <button
              onClick={() => createADashboard("5eChar")}
              id="fifth-edition-char"
              title="Create a new dashboard using a 5e Character Template."
            >
              <h3>Create A New 5e Character</h3>
            </button>
          </div>
          <div>
            <p>My Dashboards:</p>
            {dashBoardsArray
              .filter((dash) => !dash.startsWith("⭐"))
              .map((dash, index) => {
                return (
                  <button
                    title={`View and edit the ${dash} dashboard.`}
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
