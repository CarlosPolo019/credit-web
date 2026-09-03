import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AssistantDock } from "../../pages/assistant/AssistantDock.jsx";
import { assistantCopy } from "../../pages/assistant/assistant.copy.js";
import { markLessonBeatsSeen, readLessonBeatsSeen } from "../../pages/assistant/assistant.storage.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Button } from "../../ui/Button.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";

export function DashboardLayout() {
  const { state, logout } = useAuth();
  const location = useLocation();
  const isCompact = useMediaQuery("(max-width: 1100px)");
  const salespersonName = state.user?.fullName || "Usuario";
  const isAdmin = state.user?.role === "ADMIN";
  const [beatsSeen, setBeatsSeen] = useState(readLessonBeatsSeen);
  const [assistantOpen, setAssistantOpen] = useState(() => !readLessonBeatsSeen());

  const hushAssistant = () => {
    markLessonBeatsSeen();
    setBeatsSeen(true);
    setAssistantOpen(false);
  };

  const dock = (
    <AssistantDock
      isAdmin={isAdmin}
      showLesson={!beatsSeen}
      onHush={hushAssistant}
    />
  );

  return (
    <div className={`layout${assistantOpen && !isCompact ? " layout--with-assistant" : ""}`}>
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
              <NavLink to="/dashboard" className="sidebar__link">
                <InsightsOutlinedIcon fontSize="small" />
                Dashboard
              </NavLink>
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
            <AccountBalanceWalletOutlinedIcon color="secondary" />
            <Box>
              <Typography variant="overline" className="section-badge">Panel operativo</Typography>
              <Typography variant="h6">Registro y consulta de créditos</Typography>
            </Box>
          </Stack>
          <Stack className="layout__account" direction="row" spacing={1.25} alignItems="center">
            {assistantOpen ? null : (
              <Button variant="outlined" size="small" onClick={() => setAssistantOpen(true)}>
                {assistantCopy.open}
              </Button>
            )}
            <PersonChip
              className="layout__salesperson"
              name={salespersonName}
              secondaryText={isAdmin ? "Administrador" : "Comercial"}
              size={36}
            />
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
      {isCompact ? (
        <Drawer
          anchor="right"
          open={assistantOpen}
          onClose={hushAssistant}
          PaperProps={{ className: "layout__assistant-drawer" }}
        >
          {dock}
        </Drawer>
      ) : assistantOpen ? (
        <div className="layout__assistant">{dock}</div>
      ) : null}
    </div>
  );
}
