import { useContext } from "react";

import { AppContext } from "../../AppContext";

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("Context Hasn't Been Set!");
  return context;
};
