import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { listClients } from "../credits/credits.service.js";
import { Button } from "../../ui/Button.jsx";
import { Card } from "../../ui/Card.jsx";
import { DataTable } from "../../ui/DataTable.jsx";
import { Input } from "../../ui/Input.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { clientColumns } from "./clients.columns.js";

/**
 * Read-only directory of clients (cédula + nombre), derived automatically
 * from credit registrations — there's no create/edit/delete here. Admin
 * only (see app/guards/AdminRoute.jsx and DashboardLayout.jsx).
 */
export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClients = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const items = await listClients({ signal: options.signal });
      setClients(items ?? []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setClients([]);
      setError(err.message || "No se pudieron cargar los clientes.");
    } finally {
      if (!options.signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadClients({ signal: controller.signal });
    return () => controller.abort();
  }, [loadClients]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleClients = normalizedSearch
    ? clients.filter((client) =>
        `${client.document} ${client.fullName}`.toLowerCase().includes(normalizedSearch))
    : clients;

  const renderCell = (row, key) => {
    if (key === "fullName") return <PersonChip name={row.fullName} size={28} />;
    return row[key] ?? "-";
  };

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title">
        <Typography variant="overline" className="section-badge">Directorio</Typography>
        <Typography variant="h4">Clientes <span className="text-accent">registrados</span></Typography>
      </Box>

      <Collapse in={Boolean(error)} unmountOnExit>
        <div className="alert alert--error">{error}</div>
      </Collapse>

      <Card className="admin-card--padded">
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">Cédula y nombre</Typography>
              <Typography variant="body2" className="muted">Se completan solos al registrar un crédito con esa cédula.</Typography>
            </Box>
            <Button variant="outlined" onClick={loadClients} disabled={isLoading} startIcon={<RefreshIcon />}>
              Actualizar
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Buscar por cédula o nombre" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Grid>
          </Grid>
          <DataTable
            columns={clientColumns}
            rows={visibleClients}
            getRowId={(row) => row.document}
            renderCell={renderCell}
            isLoading={isLoading}
            loadingText="Cargando clientes..."
            countLabel="clientes visibles"
            emptyText="No hay clientes para mostrar."
          />
        </Stack>
      </Card>
    </Stack>
  );
}
