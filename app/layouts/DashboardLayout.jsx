import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";

export function DashboardLayout() {
  const { state, logout } = useAuth();
  const location = useLocation();
  const salespersonName = state.user?.fullName || "Usuario";
  const isAdmin = state.user?.role === "ADMIN";

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
          {isAdmin ? (
            <>
              <NavLink to="/email-jobs" className="sidebar__link">
                <ForwardToInboxOutlinedIcon fontSize="small" />
                Correos
              </NavLink>
              <NavLink to="/clients" className="sidebar__link">
                <PeopleAltOutlinedIcon fontSize="small" />
                Clientes
              </NavLink>
              <NavLink to="/users" className="sidebar__link">
                <GroupAddOutlinedIcon fontSize="small" />
                Usuarios
              </NavLink>
            </>
          ) : null}
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
          <Stack className="layout__account" direction="row" spacing={1.25} alignItems="center">
            <PersonChip className="layout__salesperson" name={salespersonName} secondaryText="Comercial" size={36} />
            <Tooltip title="Cerrar sesión">
              <IconButton onClick={logout} className="layout__logout" size="small">
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </header>
        <main className="layout__main">
          <Fade key={location.pathname} in appear timeout={220}>
            <div>
              <Outlet />
            </div>
          </Fade>
        </main>
      </section>
    </div>
  );
}
