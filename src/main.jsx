import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter.jsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <ToastContainer />
    <CssBaseline />
    <AppRouter />
  </ThemeProvider>
  // </React.StrictMode>
);
