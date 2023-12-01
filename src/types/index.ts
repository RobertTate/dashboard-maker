export type DashboardProps = {
  selectedDashboard: string;
  selectADashboard: (dashboardId: string) => void;
  deleteADashboard: (dashName: string) => Promise<void>;
  createADashboard: (
    template: NewDashboardTemplateOptions,
    duplicateDashInputRef?: React.RefObject<HTMLInputElement>,
    contentToDuplicate?: DashboardItemsProps,
  ) => Promise<void>;
};

export type SyncingGridProps = {
  dashName: string;
  isLocked: boolean;
  updateLockedStatus: (isLockedStatus: boolean) => void;
};

export type WidgetProps = {
  id: string;
  content: string;
};

export type DashboardItemsProps = {
  layouts: ReactGridLayout.Layouts;
  widgets: WidgetProps[];
  isLocked: boolean;
};

export type PremadeDashConfig = {
  fileName: string;
  dashName: string;
};

export type NewDashboardTemplateOptions = "default" | "5eChar" | "duplicate";
