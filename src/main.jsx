import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";
import "@fontsource/cascadia-mono/400.css";
import "@fontsource/cascadia-mono/600.css";
import "./styles/global.css";
import App from "./App.jsx";
import { ProgressProvider } from "./lib/progress.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProgressProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ProgressProvider>
  </React.StrictMode>
);
