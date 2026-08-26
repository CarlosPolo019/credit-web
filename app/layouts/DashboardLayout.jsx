import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export function DashboardLayout() {
  const { state, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <Box className="sidebar__brand">
          <span className="sidebar__mark">
            <img src="/fya-mark.png" alt="Fya" />
          </span>
          <Box>
            <Typography variant="overline">Fya Social Capital</Typography>
            <Typography variant="h6">Créditos</Typography>
          </Box>
        </Box>
        <nav className="sidebar__nav">
          <NavLink to="/credits" className="sidebar__link">
            <AddCardOutlinedIcon fontSize="small" />
            Créditos
          </NavLink>
          <NavLink to="/email-jobs" className="sidebar__link">
            <ForwardToInboxOutlinedIcon fontSize="small" />
            Correos
          </NavLink>
        </nav>
      </aside>
      <section className="layout__content">
        <header className="layout__header">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AccountBalanceWalletOutlinedIcon color="primary" />
            <Box>
              <Typography variant="overline" className="section-badge">Panel operativo</Typography>
              <Typography variant="h6">Registro y consulta de <span className="text-accent">créditos</span></Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="body2" className="layout__user">
              {state.user?.username ?? "Usuario"}
            </Typography>
            <Tooltip title="Cerrar sesión">
              <IconButton onClick={logout} className="layout__logout" size="small">
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </header>
        <main className="layout__main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
