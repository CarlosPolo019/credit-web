import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00d280",
      dark: "#049a5f",
      light: "#5ee6ae",
      contrastText: "#052224",
    },
    secondary: {
      main: "#052224",
      contrastText: "#ffffff",
    },
    success: {
      main: "#047857",
    },
    error: {
      main: "#dc2626",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#052224",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    overline: {
      letterSpacing: 0,
      fontWeight: 700,
      color: "#6b7280",
    },
  },
  shape: {
    borderRadius: 8,
  },
});
