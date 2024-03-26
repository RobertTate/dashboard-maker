import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useRef, useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import download from "../assets/download.svg";
import duplicate from "../assets/duplicate.svg";
import fire from "../assets/fire.svg";
import leftArrow from "../assets/leftArrow.svg";
import locked from "../assets/locked.svg";
import unlocked from "../assets/unlocked.svg";
import share from "../assets/share.svg";
import db from "../dbInstance";
import styles from "../styles/Dashboard.module.css";
import type { DashboardItemsProps, DashboardProps, SharedDashboard } from "../types";
import SyncingGrid from "./SyncingGrid";

export default function Dashboard(props: DashboardProps) {
  const {
    selectedDashboard,
    selectADashboard,
    createADashboard,
    deleteADashboard,
    standalone,
    role
  } = props;
  const [isLocked, setIsLocked] = useState(false);
  const [deleteZoneIsOpen, setDeleteZoneIsOpen] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const [duplicateZoneIsOpen, setDuplicateZoneIsOpen] = useState(false);
  const duplicateInputRef = useRef<HTMLInputElement>(null);
  const [shareZoneIsOpen, setShareZoneIsOpen] = useState(false);

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
    const currentDashboard: DashboardItemsProps | null =
      await db.getItem(selectedDashboard);
    if (currentDashboard) {
      createADashboard("duplicate", duplicateInputRef, currentDashboard);
    } else {
      duplicateInputRef!.current!.setCustomValidity(
        "Something Went Wrong. Good lord.",
      );
      duplicateInputRef!.current!.reportValidity();
    }
  };

  const handleShare = async () => {
    const currentDashboard: DashboardItemsProps | null =
      await db.getItem(selectedDashboard);
    if (currentDashboard) {
      try {
        const sharedDashboard: SharedDashboard = {
          sharedDashboardTitle: selectedDashboard,
          sharedDashboardContent: currentDashboard
        }
        await OBR.broadcast.sendMessage("com.roberttate.dashboard-maker", sharedDashboard);
        await OBR.notification.show("Dashboard Sharing Succeeded!", "SUCCESS");
      } catch (e: any) {
        const error: Error = e.error;
        await OBR.notification.show(`Dashboard Sharing Failed: ${error.name}`, "ERROR");
      } finally {
        setShareZoneIsOpen((prev) => !prev);
      }
    }
  }

  const downloadDashboard = async () => {
    const currentDashboard: DashboardItemsProps | null =
      await db.getItem(selectedDashboard);
    if (currentDashboard) {
      const jsonString = JSON.stringify(currentDashboard);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedDashboard;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={styles["dashboard"]} id={isLocked ? "locked-dash" : "unlocked-dash"}>
      <div className={`${styles["dashboard-nav"]} ${standalone ? styles["dashboard-nav--standalone"] : ''}`}>
        <button
          className="icon-button"
          title="Go Back"
          onClick={() => selectADashboard("")}
        >
          <img alt="Go Back Icon" src={leftArrow}></img>
        </button>
        <button
          className="icon-button"
          title="Delete This Dashboard"
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
          title="Duplicate This Dashboard"
          onClick={() => setDuplicateZoneIsOpen((prev) => !prev)}
        >
          <img src={duplicate} alt="Duplicate Icon" />
        </button>
        <button
          className="icon-button"
          id="download-button"
          title="Download This Dashboard"
          onClick={() => downloadDashboard()}
        >
          <img src={download} alt="Download Icon" />
        </button>

        {role === "GM" && standalone === false && (
          <button
            className="icon-button"
            id="share-button"
            title="Share This Dashboard"
            onClick={() => setShareZoneIsOpen((prev) => !prev)}
          >
            <img src={share} alt="Download Icon" />
          </button>
        )}

      </div>
      <div className={`${styles["dashboard-nav-header"]} ${standalone ? styles["dashboard-nav-header--standalone"] : ''}`}>
        <h2>{selectedDashboard}</h2>
      </div>
      <div
        className={`${styles["dashboard-delete-zone"]} ${deleteZoneIsOpen ? styles["show-delete-zone"] : ""
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
        className={`${styles["dashboard-duplicate-zone"]} ${duplicateZoneIsOpen ? styles["show-duplicate-zone"] : ""
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

      <div
        className={`${styles["dashboard-share-zone"]} ${shareZoneIsOpen ? styles["show-share-zone"] : ""
          }`}
      >
        <p>Do you want to share this dashboard in its current state with your players? Doing so will overwrite any dashboards your players have with the same name, <strong>so be careful.</strong></p>
        <div className={styles["dashboard-share-zone-confirm"]}>
          <button onClick={handleShare}>Share</button>
          <button onClick={() => setShareZoneIsOpen((prev) => !prev)}>Don't Share</button>
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
