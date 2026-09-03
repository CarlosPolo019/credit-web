import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function EmptyState({ figure, children }) {
  return (
    <Box className="empty-state">
      {figure}
      <Typography variant="body2" className="muted empty-state__copy">
        {children}
      </Typography>
    </Box>
  );
}
