import { createContext, type MutableRefObject } from "react";

export const ActiveToolbarContext = createContext<MutableRefObject<string>>(
  { current: "" } as MutableRefObject<string>,
);
