import { createContext, useCallback, useContext, useState } from "react";

import type { AppContextProps, AppProviderProps } from "./types";

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("Context Hasn't Been Set!");
  return context;
};

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
