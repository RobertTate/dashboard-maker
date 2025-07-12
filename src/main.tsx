import "@mdxeditor/editor/style.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { AppProvider } from "./AppProvider.tsx";
import "./dbInstance.ts";
import "./styles/theme.css";
import "./index.css";

const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const setTheme = (e: MediaQueryList | MediaQueryListEvent) => {
  document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
};
setTheme(themeQuery);
themeQuery.addEventListener("change", setTheme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
);
