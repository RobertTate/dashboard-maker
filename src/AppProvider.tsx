import { useCallback, useState } from "react";

import { AppContext } from "./AppContext";
import type { AppContextProps, AppProviderProps } from "./types";

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const selectADashboard = useCallback((dashName: string) => {
    setSelectedDashboard(dashName);
  }, []);

  const store: AppContextProps = {
    selectedDashboard,
    selectADashboard,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
