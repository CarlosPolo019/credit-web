import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#073d3b",
      contrastText: "#f8fffb",
    },
    secondary: {
      main: "#b78a29",
    },
    error: {
      main: "#b42318",
    },
    background: {
      default: "#f4f2eb",
      paper: "#fffdf7",
    },
  },
  typography: {
    fontFamily: '"Archivo", "Helvetica Neue", sans-serif',
    h4: {
      fontFamily: '"Source Serif 4", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Source Serif 4", serif',
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    overline: {
      letterSpacing: 0,
      fontWeight: 700,
      color: "#6f6453",
    },
  },
  shape: {
    borderRadius: 8,
  },
});
