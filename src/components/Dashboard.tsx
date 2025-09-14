import OBR from "@owlbear-rodeo/sdk";
import pako from "pako";
import { memo, useCallback, useRef, useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DownloadIcon from "../assets/download.svg?react";
import DuplicateIcon from "../assets/duplicate.svg?react";
import FireIcon from "../assets/fire.svg?react";
import LeftArrowIcon from "../assets/leftArrow.svg?react";
import LockedIcon from "../assets/locked.svg?react";
import ShareIcon from "../assets/share.svg?react";
import ToggleIcon from "../assets/toggle.svg?react";
import UnlockedIcon from "../assets/unlocked.svg?react";
import db from "../dbInstance";
import { useAppStore } from "../functions/hooks";
import styles from "../styles/Dashboard.module.css";
import type {
  DashboardItemsProps,
  DashboardProps,
  SharedDashboard,
} from "../types";
import ColumnToggle from "./ColumnToggle";
import SyncingGrid from "./SyncingGrid";

const Dashboard = memo((props: DashboardProps) => {
  const { createADashboard, deleteADashboard, standalone, role } = props;
  const { selectedDashboard, selectADashboard } = useAppStore();
  const [isLocked, setIsLocked] = useState(false);
  const [columns, setColumns] = useState(8);
  const [deleteZoneIsOpen, setDeleteZoneIsOpen] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const [duplicateZoneIsOpen, setDuplicateZoneIsOpen] = useState(false);
  const [columntoggleZoneIsOpen, setColumnToggleZoneIsOpen] = useState(false);
  const duplicateInputRef = useRef<HTMLInputElement>(null);
  const [shareZoneIsOpen, setShareZoneIsOpen] = useState(false);

  const updateLockedStatus = useCallback((isLockedStatus: boolean) => {
    setIsLocked(isLockedStatus);
  }, []);

  const updateColsStatus = useCallback((cols: number) => {
    setColumns(cols);
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

  const handleDeleteOnEnter: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key == "Enter") {
      event.preventDefault();
      handleDelete();
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
          sharedDashboardContent: currentDashboard,
        };
        const stringified = JSON.stringify(sharedDashboard);
        const compressedUint8Array = pako.gzip(stringified);
        const compressedUint8ArrayString = String.fromCharCode(
          ...compressedUint8Array,
        );
        const b64EncodedCompressedUint8ArrayString = btoa(
          compressedUint8ArrayString,
        );
        await OBR.broadcast.sendMessage(
          "com.roberttate.dashboard-maker",
          b64EncodedCompressedUint8ArrayString,
        );
        await OBR.notification.show("Dashboard Sharing Succeeded!", "SUCCESS");
      } catch (e) {
        await OBR.notification.show(`Dashboard Sharing Failed`, "ERROR");
      } finally {
        setShareZoneIsOpen((prev) => !prev);
      }
    }
  };

  const downloadDashboard = async () => {
    const currentDashboard: DashboardItemsProps | null =
      await db.getItem(selectedDashboard);
    if (currentDashboard) {
      const jsonString = JSON.stringify(currentDashboard);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDashboard}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className={styles["dashboard"]}
      id={isLocked ? "locked-dash" : "unlocked-dash"}
    >
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
              width: "20px"
            }}
          />
        </button>
        <button
          className="icon-button"
          title="Delete This Dashboard"
          onClick={() => setDeleteZoneIsOpen((prev) => !prev)}
        >
          <FireIcon
            className="icon-svg-fire"
            style={{
              width: "20px"
            }}
          />
        </button>
        <button
          className="icon-button"
          title={isLocked ? "Click To Unlock" : "Click To Lock"}
          onClick={() => setIsLocked((prev) => !prev)}
        >
          {isLocked ? (
            <LockedIcon
              className="icon-svg-dash-menu"
              style={{
                width: "20px"
              }}
            />
          ) : (
            <UnlockedIcon
              className="icon-svg-dash-menu"
              style={{
                width: "20px"
              }}
            />
          )}

        </button>
        <button
          className="icon-button"
          id="toggle-button"
          title="Toggle The Number of Dashboard Columns"
          onClick={() => setColumnToggleZoneIsOpen((prev) => !prev)}
        >
          <ToggleIcon
            className="icon-svg-dash-menu"
            style={{
              width: "20px"
            }}
          />
        </button>
        <button
          className="icon-button"
          title="Duplicate This Dashboard"
          onClick={() => setDuplicateZoneIsOpen((prev) => !prev)}
        >
          <DuplicateIcon
            className="icon-svg-dash-menu"
            style={{
              width: "20px"
            }}
          />
        </button>
        <button
          className="icon-button"
          id="download-button"
          title="Download This Dashboard"
          onClick={() => downloadDashboard()}
        >
          <DownloadIcon
            className="icon-svg-download"
            style={{
              width: "20px"
            }}
          />
        </button>

        {role === "GM" && standalone === false && (
          <button
            className="icon-button"
            id="share-button"
            title="Share This Dashboard"
            onClick={() => setShareZoneIsOpen((prev) => !prev)}
          >
            <ShareIcon
              className="icon-svg-share"
              style={{
                width: "20px"
              }}
            />
          </button>
        )}
      </div>
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
              href="https://discord.com/channels/795808973743194152/1248695489558483007"
            >
              Community Made Dashboards
            </a>
          </p>
        </div>
      </div>
      <div className={`${styles["dashboard-nav-header"]}`}>
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
            onKeyDown={handleDeleteOnEnter}
          />
          <button onClick={handleDelete}>Submit</button>
        </div>
      </div>

      <div
        className={`${styles["dashboard-columntoggle-zone"]} ${columntoggleZoneIsOpen ? styles["show-columntoggle-zone"] : ""
          }`}
      >
        <p>
          Behold, <strong>the column toggler.</strong> Use its power to change
          the base number of columns in the dashboard between 8 and 12. Use
          wisely.
        </p>
        <div className={styles["dashboard-columntoggle-zone-confirm"]}>
          <ColumnToggle columns={columns} updateColsStatus={updateColsStatus} />
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
            name="dashboardDuplicateField"
            required
          />
          <button onClick={handleDuplicate}>Submit</button>
        </div>
      </div>

      <div
        className={`${styles["dashboard-share-zone"]} ${shareZoneIsOpen ? styles["show-share-zone"] : ""
          }`}
      >
        <p>
          Do you want to share this dashboard in its current state with your
          players? Doing so will overwrite any dashboards your players have with
          the same name, <strong>so be careful.</strong>
        </p>
        <div className={styles["dashboard-share-zone-confirm"]}>
          <button onClick={handleShare}>Share</button>
          <button onClick={() => setShareZoneIsOpen((prev) => !prev)}>
            Don't Share
          </button>
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
