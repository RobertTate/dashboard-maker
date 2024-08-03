export type Role = "GM" | "PLAYER" | undefined;

export type DashboardProps = {
  selectedDashboard: string;
  selectADashboard: (dashboardId: string) => void;
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
}

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
