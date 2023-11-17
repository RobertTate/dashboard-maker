export type DashboardProps = {
  selectedDashboard: string;
  selectADashboard: (dashboardId: string) => void;
  deleteADashboard: (dashName: string) => Promise<void>
}

export type SyncingGridProps = {
  dashName: string
}

export type WidgetProps = {
  id: string;
  content: string;
}

export type DashboardItemsProps = {
  layouts: ReactGridLayout.Layouts;
  widgets: WidgetProps[]
}
