import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Button } from "../../ui/Button.jsx";
import { Card } from "../../ui/Card.jsx";
import { Input } from "../../ui/Input.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { createUser } from "./users.service.js";

// "USER" first/default on purpose — the stated use case is creating
// comercial test accounts. "ADMIN" is offered too because the backend
// supports it (only for an authenticated admin caller, see
// users.service.js), but it's an explicit opt-in, not the default.
const ROLE_OPTIONS = [
  { value: "USER", label: "Usuario (comercial)" },
  { value: "ADMIN", label: "Administrador" },
];

const EMPTY_FORM = { fullName: "", document: "", password: "", role: "USER" };

function randomPassword() {
  // Test-account passwords, not real secrets — random enough to avoid
  // collisions between accounts created in the same session, nothing more.
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Admin-only: create USER (or, deliberately, ADMIN) test accounts via the
 * dedicated `POST /api/v1/users` endpoint. See `users.service.js` for why
 * this doesn't touch the admin's own session — that endpoint never issues
 * a token for the created account, so there's no session-shaped response
 * to accidentally write over the admin's.
 *
 * There's no "list users" endpoint in credit-backend, so this can't show a
 * directory of existing accounts — only the ones created in this browser
 * session, kept in local state. Each account's password is shown once,
 * right after creation, because it's never stored anywhere retrievable
 * afterwards (the backend only keeps the bcrypt hash).
 */
export function UsersPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUsers, setCreatedUsers] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "document" ? value.replace(/\D/g, "") : value;
    setForm((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleGeneratePassword = () => {
    setForm((previous) => ({ ...previous, password: randomPassword() }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await createUser(form);
      setCreatedUsers((previous) => [
        {
          fullName: response.fullName,
          document: response.document,
          password: form.password,
          // From the response, not `form.role` — this is what the backend
          // actually assigned. They should match here, but showing the
          // real value is safer than assuming the request was honored.
          role: response.role,
        },
        ...previous,
      ]);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title">
        <Typography variant="overline" className="section-badge">Cuentas</Typography>
        <Typography variant="h4">Crear cuenta de prueba</Typography>
        <Typography variant="body2" className="muted">
          Crea cuentas `USER` para que comerciales prueben la app. No afecta tu sesión de admin.
        </Typography>
      </Box>

      <Card className="admin-card--padded">
        <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
          <Typography variant="h5">Nueva cuenta</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="Nombre completo"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="Cédula"
                name="document"
                value={form.document}
                onChange={handleChange}
                slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="Contraseña"
                name="password"
                value={form.password}
                onChange={handleChange}
                helperText="Mínimo 8 caracteres."
                slotProps={{
                  input: {
                    endAdornment: (
                      <Tooltip title="Generar contraseña">
                        <IconButton onClick={handleGeneratePassword} edge="end" size="small">
                          <CasinoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                select
                label="Rol"
                name="role"
                value={form.role}
                onChange={handleChange}
                helperText="Comercial (USER) para pruebas. Administrador solo si de verdad hace falta otro admin."
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Input>
            </Grid>
          </Grid>
          <Collapse in={Boolean(error)} unmountOnExit>
            <div className="form-error">{error}</div>
          </Collapse>
          <Box>
            <Button type="submit" loading={isSubmitting} loadingText="Creando..." startIcon={<GroupAddOutlinedIcon />}>
              Crear cuenta
            </Button>
          </Box>
        </Stack>
      </Card>

      {createdUsers.length > 0 ? (
        <Card className="admin-card--padded">
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5">Cuentas creadas en esta sesión</Typography>
              <Typography variant="body2" className="muted">
                La contraseña solo se muestra acá, una vez — no hay forma de recuperarla después. Compartila con el comercial y decile que la cambie si hace falta.
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              {createdUsers.map((user) => (
                <Card key={`${user.document}-${user.password}`} className="admin-card" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                    <PersonChip name={user.fullName} secondaryText={`Cédula ${user.document} · ${user.role}`} size={32} />
                    <Typography variant="body2" fontFamily="monospace">
                      Contraseña: {user.password}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
