import { createTheme } from "@mui/material/styles";

export const fya = {
  paper: "#F6F7F5",
  ink: "#052224",
  sage: "#D7EDE3",
  green: "#00d280",
  greenHover: "#049a5f",
  error: "#dc2626",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: fya.green,
      dark: fya.greenHover,
      light: "#5ee6ae",
      contrastText: fya.ink,
    },
    secondary: {
      main: fya.ink,
      contrastText: fya.paper,
    },
    success: {
      main: fya.greenHover,
    },
    error: {
      main: fya.error,
    },
    background: {
      default: fya.paper,
      paper: fya.paper,
    },
    text: {
      primary: fya.ink,
      secondary: "rgba(5, 34, 36, 0.62)",
    },
    divider: "rgba(5, 34, 36, 0.08)",
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
    overline: {
      letterSpacing: 0.04,
      fontWeight: 700,
      color: "rgba(5, 34, 36, 0.56)",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: fya.paper,
          color: fya.ink,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedPrimary: {
          backgroundColor: fya.green,
          color: fya.ink,
          "&:hover": {
            backgroundColor: fya.greenHover,
          },
        },
        outlined: {
          borderColor: "rgba(5, 34, 36, 0.16)",
          color: fya.ink,
        },
        text: {
          color: fya.ink,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: fya.ink,
          transition: "transform 0.15s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "scale(1.08)",
            backgroundColor: fya.sage,
          },
          "&:active": {
            transform: "scale(0.96)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: fya.paper,
          backgroundImage: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: fya.paper,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(5, 34, 36, 0.16)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(5, 34, 36, 0.32)",
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
