import "@mdxeditor/editor/style.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { AppProvider } from "./AppProvider.tsx";
import db from "./dbInstance";
import "./dbInstance.ts";
import "./index.css";
import "./styles/theme.css";

const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const mode = (await db.getItem("Dash_Mode_String")) as string;

const setMode = async (e: MediaQueryList | MediaQueryListEvent) => {
  if (mode) {
    document.documentElement.setAttribute("data-mode", mode);
  } else {
    document.documentElement.setAttribute(
      "data-mode",
      e.matches ? "dark" : "light",
    );
  }
};

const setTheme = async () => {
  const theme = (await db.getItem("Dash_Theme_String")) as string;
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.setAttribute("data-theme", "default");
  }
};

setMode(themeQuery);
setTheme();
themeQuery.addEventListener("change", setMode);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
);
