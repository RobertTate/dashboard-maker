import "@mdxeditor/editor/style.css";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./dbInstance.ts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
