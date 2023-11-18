import { useCallback, useState } from "react";
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
  const [isLocked, setIsLocked] = useState(false);

  const updateLockedStatus = useCallback((isLockedStatus: boolean) => {
    setIsLocked(isLockedStatus);
  }, [])

  const {
    selectedDashboard,
    selectADashboard,
    deleteADashboard
  } = props;

  return (
    <div id={isLocked ? "lockedDash" : "unlockedDash"} className={styles.dashboardAll}>
      <div className={styles.dashboardNav}>
        <button title="Go Back" onClick={() => selectADashboard('')}><img alt="Go Back Icon" src={leftArrow}></img></button>
        <button title="Delete Dashboard" onClick={() => deleteADashboard(selectedDashboard)}><img alt="Delete Dashboard" src={fire}></img></button>
        <button title={isLocked ? "Click To Unlock" : "Click To Lock"} onClick={() => setIsLocked((prev) => !prev)}>
          <img src={isLocked ? locked : unlocked} alt={isLocked ? "Locked Padlock" : "Unlocked Padlock"} />
        </button>
        <h2>{selectedDashboard}</h2>
      </div>
      <SyncingGrid isLocked={isLocked} updateLockedStatus={updateLockedStatus} dashName={selectedDashboard} />
    </div>
  )
}
