import { useCallback, useRef, useState } from "react";
import SyncingGrid from "./SyncingGrid";
import styles from "../styles/Dashboard.module.css";
import leftArrow from "../assets/leftArrow.svg";
import fire from "../assets/fire.svg";
import unlocked from "../assets/unlocked.svg";
import locked from "../assets/locked.svg";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { DashboardProps } from "../types";

export default function Dashboard(props: DashboardProps) {
  const { selectedDashboard, selectADashboard, deleteADashboard } = props;
  const [isLocked, setIsLocked] = useState(false);
  const [deleteZoneIsOpen, setDeleteZoneIsOpen] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null)

  const updateLockedStatus = useCallback((isLockedStatus: boolean) => {
    setIsLocked(isLockedStatus);
  }, []);

  const handleDelete = () => {
    if (deleteInputRef.current?.value === "DELETE") {
      deleteADashboard(selectedDashboard);
    } else {
      deleteInputRef!.current!.setCustomValidity(
        "Only typing DELETE in all uppercase letters will trigger a dashboard deletion.",
      );
      deleteInputRef!.current!.reportValidity();
    }
  }

  return (
    <div
      id={isLocked ? "locked-dash" : "unlocked-dash"}
    >
      <div className={styles["dashboard-nav"]}>
        <button
          className="icon-button"
          title="Go Back"
          onClick={() => selectADashboard("")}
        >
          <img alt="Go Back Icon" src={leftArrow}></img>
        </button>
        <button
          className="icon-button"
          title="Delete Dashboard"
          onClick={() => setDeleteZoneIsOpen((prev) => !prev)}
        >
          <img alt="Delete Dashboard" src={fire}></img>
        </button>
        <button
          className="icon-button"
          title={isLocked ? "Click To Unlock" : "Click To Lock"}
          onClick={() => setIsLocked((prev) => !prev)}
        >
          <img
            src={isLocked ? locked : unlocked}
            alt={isLocked ? "Locked Padlock" : "Unlocked Padlock"}
          />
        </button>
        <h2>{selectedDashboard}</h2>
      </div>

        <div className={`${styles["dashboard-delete-zone"]} ${deleteZoneIsOpen ? styles["show-delete-zone"] : ''}`}>
          <p>Type "DELETE" to delete this Dashboard Permanently</p>
          <div className={styles["dashboard-delete-zone-confirm"]}>
            <input
              ref={deleteInputRef}
              type="text"
              name="dashboardDeleteField"
              required
            />
            <button onClick={handleDelete}>Submit</button>
          </div>
        </div>
      
      <SyncingGrid
        isLocked={isLocked}
        updateLockedStatus={updateLockedStatus}
        dashName={selectedDashboard}
      />
    </div>
  );
}
