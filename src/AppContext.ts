import { createContext } from "react";

import type { AppContextProps } from "./types";

export const AppContext = createContext<AppContextProps | undefined>(undefined);
