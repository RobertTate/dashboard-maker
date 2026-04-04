import { memo, useCallback, useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import LeftArrowIcon from "../assets/leftArrow.svg?react";
import { useAppStore } from "../functions/hooks";
import styles from "../styles/Dashboard.module.css";
import type { DashboardProps } from "../types";
import DashboardMenu from "./DashboardMenu";
import SyncingGrid from "./SyncingGrid";

const Dashboard = memo((props: DashboardProps) => {
  const { createADashboard, deleteADashboard, standalone, role } = props;
  const { selectedDashboard, selectADashboard } = useAppStore();
  const [isLocked, setIsLocked] = useState(false);
  const [columns, setColumns] = useState(8);

  const updateLockedStatus = useCallback((isLockedStatus: boolean) => {
    setIsLocked(isLockedStatus);
  }, []);

  const updateColsStatus = useCallback((cols: number) => {
    setColumns(cols);
  }, []);

  return (
    <div
      className={styles["dashboard"]}
      id={isLocked ? "locked-dash" : "unlocked-dash"}
    >
      <div className={`${styles["dashboard-toolbar-container"]} cancelDrag`}>
        <div className={`${styles["dashboard-toolbar-zone"]}`} id="toolbar">
          <p className={styles["dashboard-toolbar-zone-placeholder"]}>
            Useful Links: &nbsp;
            <a
              target="_blank"
              href="https://extensions.owlbear.rodeo/dashboard-maker"
            >
              Docs
            </a>
            &nbsp;/&nbsp;
            <a
              target="_blank"
              href="https://github.com/RobertTate/dashboard-maker"
            >
              Codebase
            </a>
            &nbsp;/&nbsp;
            <a
              target="_blank"
              href="https://discord.com/channels/795808973743194152/1412776692124094515/1412776751615967333"
            >
              Community Made Dashboards
            </a>
          </p>
        </div>
      </div>
      <div className={`${styles["dashboard-nav-header"]}`}>
        <h2>{selectedDashboard}</h2>
        <div
          className={`${styles["dashboard-nav"]} ${standalone ? styles["dashboard-nav--standalone"] : ""
            }`}
        >
          <button
            className="icon-button"
            title="Go Back"
            onClick={() => selectADashboard("")}
          >
            <LeftArrowIcon
              className="icon-svg-back"
              style={{
                width: "20px",
              }}
            />
          </button>
          <DashboardMenu
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            columns={columns}
            updateColsStatus={updateColsStatus}
            deleteADashboard={deleteADashboard}
            createADashboard={createADashboard}
            standalone={standalone}
            role={role}
          />
        </div>


      </div>

      <SyncingGrid
        isLocked={isLocked}
        columns={columns}
        updateLockedStatus={updateLockedStatus}
        updateColsStatus={updateColsStatus}
        dashName={selectedDashboard}
      />
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
