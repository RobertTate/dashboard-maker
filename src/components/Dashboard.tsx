import localforage from "localforage";
import { useCallback, useRef, useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import fire from "../assets/fire.svg";
import leftArrow from "../assets/leftArrow.svg";
import locked from "../assets/locked.svg";
import unlocked from "../assets/unlocked.svg";
import duplicate from "../assets/duplicate.svg";
import styles from "../styles/Dashboard.module.css";
import SyncingGrid from "./SyncingGrid";

import type { DashboardProps, DashboardItemsProps } from "../types";

export default function Dashboard(props: DashboardProps) {
  const { selectedDashboard, selectADashboard, createADashboard, deleteADashboard } = props;
  const [isLocked, setIsLocked] = useState(false);
  const [deleteZoneIsOpen, setDeleteZoneIsOpen] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const [duplicateZoneIsOpen, setDuplicateZoneIsOpen] = useState(false);
  const duplicateInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleDuplicate = async () => {
    const currentDashboard: DashboardItemsProps | null = await localforage.getItem(selectedDashboard);
    if (currentDashboard) {
      createADashboard("duplicate", duplicateInputRef, currentDashboard)
    } else {
      duplicateInputRef!.current!.setCustomValidity(
        "Something Went Wrong. Good lord.",
      );
      duplicateInputRef!.current!.reportValidity();
    }
  }

  return (
    <div className="dashboard" id={isLocked ? "locked-dash" : "unlocked-dash"}>
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
          <img alt="Delete Icon" src={fire}></img>
        </button>
        <button
          className="icon-button"
          title={isLocked ? "Click To Unlock" : "Click To Lock"}
          onClick={() => setIsLocked((prev) => !prev)}
        >
          <img
            src={isLocked ? locked : unlocked}
            alt={isLocked ? "Locked Padlock Icon" : "Unlocked Padlock Icon"}
          />
        </button>
        <button
          className="icon-button"
          title="Duplicate Dashboard"
          onClick={() => setDuplicateZoneIsOpen((prev) => !prev)}
        >
          <img 
            src={duplicate}
            alt="Duplicate Icon"
          />
        </button>
        <h2>{selectedDashboard}</h2>
      </div>

      <div
        className={`${styles["dashboard-delete-zone"]} ${
          deleteZoneIsOpen ? styles["show-delete-zone"] : ""
        }`}
      >
        <p>Type "DELETE" to delete this dashboard permanently.</p>
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

      <div
        className={`${styles["dashboard-duplicate-zone"]} ${
          duplicateZoneIsOpen ? styles["show-duplicate-zone"] : ""
        }`}
      >
        <p>Clone this dashboard by typing in a new name for the duplicate.</p>
        <div className={styles["dashboard-duplicate-zone-confirm"]}>
          <input
            ref={duplicateInputRef}
            type="text"
            name="dashboardDeleteField"
            required
          />
          <button onClick={handleDuplicate}>Submit</button>
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
