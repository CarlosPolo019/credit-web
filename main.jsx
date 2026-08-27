import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { App } from "./app/App.jsx";
import { BackendWakeGate } from "./app/BackendWakeGate.jsx";
import { theme } from "./ui/theme.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackendWakeGate>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BackendWakeGate>
    </ThemeProvider>
  </React.StrictMode>,
);
