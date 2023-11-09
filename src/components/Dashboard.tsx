type DashboardProps = {
  selectedDashboard: string;
  selectADashboard: (dashboardId: string) => void;
  deleteADashboard: (dashName: string) => Promise<void>
}

export default function Dashboard(props: DashboardProps) {
  const {
    selectedDashboard,
    selectADashboard,
    deleteADashboard
  } = props;
  return (
    <>
      <p>DashBoard: <strong>{selectedDashboard}</strong></p>
      <button onClick={() => selectADashboard('')}>&larr; Back To Menu</button>
      <button onClick={() => deleteADashboard(selectedDashboard)}>Delete This Dashboard</button>
    </>
  )
}
