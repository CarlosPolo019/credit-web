import Paper from "@mui/material/Paper";
import { forwardRef } from "react";

export const Card = forwardRef(function Card({ className = "", ...props }, ref) {
  return <Paper ref={ref} elevation={0} className={`admin-card ${className}`} {...props} />;
});
