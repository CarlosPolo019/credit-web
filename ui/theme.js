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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "transform 0.15s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "scale(1.08)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
        },
      },
    },
  },
});
