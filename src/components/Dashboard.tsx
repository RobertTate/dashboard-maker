import SyncingGrid from "./SyncingGrid";
import styles from "../styles/Dashboard.module.css";
import leftArrow from "../assets/leftArrow.svg";
import fire from "../assets/fire.svg";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { DashboardProps } from "../types";


export default function Dashboard(props: DashboardProps) {
  const {
    selectedDashboard,
    selectADashboard,
    deleteADashboard
  } = props;

  return (
    <div className={styles.dashboardAll}>
      <div className={styles.dashboardNav}>
        <button title="Go Back" onClick={() => selectADashboard('')}><img alt="Go Back Icon" src={leftArrow}></img></button>
        <button title="Delete Dashboard" onClick={() => deleteADashboard(selectedDashboard)}><img alt="Delete Dashboard" src={fire}></img></button>
        <h3>{selectedDashboard}</h3>
      </div>
      <SyncingGrid dashName={selectedDashboard} />
    </div>
  )
}
