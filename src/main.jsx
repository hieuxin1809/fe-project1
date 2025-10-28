import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter.jsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { ToastContainer } from "react-toastify";

// cau hinh redux
import { Provider } from 'react-redux'

import { store } from './redux/store.js'
ReactDOM.createRoot(document.getElementById("root")).render(
   <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
   </Provider>
);
