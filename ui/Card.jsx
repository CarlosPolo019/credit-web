import Paper from "@mui/material/Paper";

export function Card({ className = "", ...props }) {
  return <Paper elevation={0} className={`admin-card ${className}`} {...props} />;
}
