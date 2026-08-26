import CircularProgress from "@mui/material/CircularProgress";
import MuiButton from "@mui/material/Button";

export function Button({ loading = false, loadingText, children, disabled, startIcon, ...props }) {
  return (
    <MuiButton
      variant="contained"
      disableElevation
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress color="inherit" size={16} /> : startIcon}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
}
