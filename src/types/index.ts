import { ReactElement } from "react";

export type Role = "GM" | "PLAYER" | undefined;

export type DashboardProps = {
  deleteADashboard: (dashName: string) => Promise<void>;
  createADashboard: (
    template: NewDashboardTemplateOptions,
    duplicateDashInputRef?: React.RefObject<HTMLInputElement>,
    contentToDuplicate?: DashboardItemsProps,
  ) => Promise<void>;
  standalone: boolean;
  role: Role;
};

export type SyncingGridProps = {
  dashName: string;
  isLocked: boolean;
  columns: number;
  updateLockedStatus: (isLockedStatus: boolean) => void;
  updateColsStatus: (columns: number) => void;
};

export type ColumnToggleProps = {
  updateColsStatus: (columns: number) => void;
  columns: number;
};

export type WidgetProps = {
  id: string;
  content: string;
};

export type DashboardItemsProps = {
  layouts: ReactGridLayout.Layouts;
  widgets: WidgetProps[];
  isLocked: boolean;
  columns: number;
};

export type PremadeDashConfig = {
  fileName: string;
  dashName: string;
};

export type PopOverProps = {
  standalone?: boolean;
  role: Role;
};

export type SharedDashboard = {
  sharedDashboardTitle: string;
  sharedDashboardContent: DashboardItemsProps;
};

export type NewDashboardTemplateOptions = "default" | "5eChar" | "duplicate";

export type RollBroadcast = {
  playerName: string;
  rollResult: number;
  diceNotation: string;
  rawResults: any;
};

export type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

export type Folder = {
  dashboards?: string[];
  folders?: FolderSystem;
  layouts?: ReactGridLayout.Layouts;
};

export type FolderSystem = {
  [key: string]: Folder;
};

export type MenuObject = {
  layouts?: ReactGridLayout.Layouts;
  folders: FolderSystem;
  dashboards: string[];
  currentFolder: string[];
};

export type DashboardFileSystemProps = {
  dashBoardsArray: string[];
  menuObject: MenuObject;
  setMenuObject: React.Dispatch<React.SetStateAction<MenuObject>>;
  setSyncStorage: React.Dispatch<React.SetStateAction<number>>;
};

export type FolderCreatorProps = {
  menuObject: MenuObject;
  setMenuObject: React.Dispatch<React.SetStateAction<MenuObject>>;
  setSyncStorage: React.Dispatch<React.SetStateAction<number>>;
};

export type AppContextProps = {
  selectedDashboard: string;
  selectADashboard: (dashName: string) => void;
};

export type AppProviderProps = {
  children: ReactElement | ReactElement[];
};
