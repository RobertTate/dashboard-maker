import { Cross2Icon, GearIcon } from "@radix-ui/react-icons";
import OBR from "@owlbear-rodeo/sdk";
import pako from "pako";
import { memo, useRef, useState } from "react";
import { Dialog, DropdownMenu } from "radix-ui";

import DownloadIcon from "../assets/download.svg?react";
import DuplicateIcon from "../assets/duplicate.svg?react";
import FireIcon from "../assets/fire.svg?react";
import LockedIcon from "../assets/locked.svg?react";
import ShareIcon from "../assets/share.svg?react";
import ToggleIcon from "../assets/toggle.svg?react";
import UnlockedIcon from "../assets/unlocked.svg?react";
import db from "../dbInstance";
import { useAppStore } from "../functions/hooks";
import styles from "../styles/DashboardMenu.module.css";
import type { DashboardItemsProps, Role, SharedDashboard } from "../types";
import ColumnToggle from "./ColumnToggle";

type DashboardMenuProps = {
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  columns: number;
  updateColsStatus: (cols: number) => void;
  deleteADashboard: (dashName: string) => Promise<void>;
  createADashboard: (
    template: "duplicate",
    duplicateDashInputRef: React.RefObject<HTMLInputElement>,
    contentToDuplicate: DashboardItemsProps,
  ) => Promise<void>;
  standalone: boolean;
  role: Role;
};

const DashboardMenu = memo((props: DashboardMenuProps) => {
  const {
    isLocked,
    setIsLocked,
    columns,
    updateColsStatus,
    deleteADashboard,
    createADashboard,
    standalone,
    role,
  } = props;

  const { selectedDashboard } = useAppStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const deleteInputRef = useRef<HTMLInputElement>(null);
  const duplicateInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (deleteInputRef.current?.value === "DELETE") {
      deleteADashboard(selectedDashboard);
      setDeleteDialogOpen(false);
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
    if (event.key === "Enter") {
      event.preventDefault();
      handleDelete();
    }
  };

  const handleDuplicate = async () => {
    const currentDashboard: DashboardItemsProps | null =
      await db.getItem(selectedDashboard);
    if (currentDashboard) {
      await createADashboard("duplicate", duplicateInputRef, currentDashboard);
      setDuplicateDialogOpen(false);
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
        setShareDialogOpen(false);
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
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={styles.IconButton}
            aria-label="Dashboard options"
            title="Options"
          >
            <GearIcon style={{width: "20px", height: "20px"}} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={styles.Content}
            sideOffset={5}
            collisionPadding={15}
          >
            <DropdownMenu.Item
              className={styles.Item}
              onSelect={() => setIsLocked((prev) => !prev)}
            >
              <span className={styles.LeftSlot}>
                {isLocked ? <LockedIcon /> : <UnlockedIcon />}
              </span>
              {isLocked ? "Unlock Dashboard" : "Lock Dashboard"}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className={styles.Item}
              onSelect={() => setColumnDialogOpen(true)}
            >
              <span className={styles.LeftSlot}>
                <ToggleIcon />
              </span>
              Toggle Columns
            </DropdownMenu.Item>

            <DropdownMenu.Separator className={styles.Separator} />

            <DropdownMenu.Item
              className={styles.Item}
              onSelect={() => downloadDashboard()}
            >
              <span className={styles.LeftSlot}>
                <DownloadIcon />
              </span>
              Download
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className={styles.Item}
              onSelect={() => setDuplicateDialogOpen(true)}
            >
              <span className={styles.LeftSlot}>
                <DuplicateIcon />
              </span>
              Duplicate
            </DropdownMenu.Item>

            {role === "GM" && standalone === false && (
              <DropdownMenu.Item
                className={styles.Item}
                onSelect={() => setShareDialogOpen(true)}
              >
                <span className={styles.LeftSlot}>
                  <ShareIcon />
                </span>
                Share with Players
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className={styles.Separator} />

            <DropdownMenu.Item
              className={styles.Item}
              onSelect={() => setDeleteDialogOpen(true)}
            >
              <span className={styles.LeftSlot}>
                <FireIcon style={{fill: "var(--fire)"}} />
              </span>
              Delete Dashboard
            </DropdownMenu.Item>

            <DropdownMenu.Arrow className={styles.Arrow} width={10} height={10} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Delete Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <Dialog.Title className={styles.DialogTitle}>
              Delete Dashboard
            </Dialog.Title>
            <Dialog.Description className={styles.DialogDescription}>
              Type "DELETE" to delete this dashboard permanently.
            </Dialog.Description>
            <input
              ref={deleteInputRef}
              className={styles.DialogInput}
              type="text"
              name="dashboardDeleteField"
              required
              onKeyDown={handleDeleteOnEnter}
            />
            <div className={styles.DialogActions}>
              <Dialog.Close asChild>
                <button>Cancel</button>
              </Dialog.Close>
              <button onClick={handleDelete}>Submit</button>
            </div>
            <Dialog.Close asChild>
              <button className={styles.DialogClose} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Duplicate Dialog */}
      <Dialog.Root open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <Dialog.Title className={styles.DialogTitle}>
              Duplicate Dashboard
            </Dialog.Title>
            <Dialog.Description className={styles.DialogDescription}>
              Clone this dashboard by typing in a new name for the duplicate.
            </Dialog.Description>
            <input
              ref={duplicateInputRef}
              className={styles.DialogInput}
              type="text"
              name="dashboardDuplicateField"
              required
            />
            <div className={styles.DialogActions}>
              <Dialog.Close asChild>
                <button>Cancel</button>
              </Dialog.Close>
              <button onClick={handleDuplicate}>Submit</button>
            </div>
            <Dialog.Close asChild>
              <button className={styles.DialogClose} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Column Toggle Dialog */}
      <Dialog.Root open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <Dialog.Title className={styles.DialogTitle}>
              Column Toggler
            </Dialog.Title>
            <Dialog.Description className={styles.DialogDescription}>
              <strong>Behold, the column toggler.</strong> Use it to change the base number of columns in the dashboard between 8 and
              12. Use wisely.
            </Dialog.Description>
            <ColumnToggle columns={columns} updateColsStatus={updateColsStatus} />
            <div className={styles.DialogActions}>
              <Dialog.Close asChild>
                <button>Done</button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button className={styles.DialogClose} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Share Dialog */}
      <Dialog.Root open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <Dialog.Title className={styles.DialogTitle}>
              Share Dashboard
            </Dialog.Title>
            <Dialog.Description className={styles.DialogDescription}>
              Do you want to share this dashboard in its current state with your
              players? Doing so will overwrite any dashboards your players have
              with the same name, <strong>so be careful.</strong>
            </Dialog.Description>
            <div className={styles.DialogActions}>
              <Dialog.Close asChild>
                <button>Don't Share</button>
              </Dialog.Close>
              <button onClick={handleShare}>Share</button>
            </div>
            <Dialog.Close asChild>
              <button className={styles.DialogClose} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});

DashboardMenu.displayName = "DashboardMenu";

export default DashboardMenu;
