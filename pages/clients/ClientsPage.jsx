import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listClients } from "../credits/credits.service.js";
import { Button } from "../../ui/Button.jsx";
import { Card } from "../../ui/Card.jsx";
import { DataTable } from "../../ui/DataTable.jsx";
import { EmptyState } from "../../ui/EmptyState.jsx";
import { Input } from "../../ui/Input.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { PortraitEmptyClients } from "../../ui/illustrations/portraits.jsx";
import { clientColumns } from "./clients.columns.js";

/**
 * Read-only directory of clients (cédula + nombre), derived automatically
 * from credit registrations — there's no create/edit/delete here. Admin
 * only (see app/guards/AdminRoute.jsx and DashboardLayout.jsx).
 */
const PAGE_SIZE = 6;

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [search]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleClients = normalizedSearch
    ? clients.filter((client) =>
        `${client.document} ${client.fullName}`.toLowerCase().includes(normalizedSearch))
    : clients;

  const pageCount = Math.max(1, Math.ceil(visibleClients.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [page, clampedPage]);

  const pagedClients = useMemo(
    () => visibleClients.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE),
    [visibleClients, clampedPage],
  );

  const renderCell = (row, key) => {
    if (key === "fullName") return <PersonChip name={row.fullName} size={28} />;
    return row[key] ?? "-";
  };

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title">
        <Typography variant="overline" className="section-badge">Directorio</Typography>
        <Typography variant="h4">Clientes registrados</Typography>
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
            rows={pagedClients}
            getRowId={(row) => row.document}
            renderCell={renderCell}
            isLoading={isLoading}
            loadingText="Cargando clientes..."
            countLabel="clientes visibles"
            emptyContent={(
              <EmptyState figure={<PortraitEmptyClients size={120} />}>
                {normalizedSearch ? "No hay clientes con esa búsqueda." : "Todavía no hay clientes en el directorio."}
              </EmptyState>
            )}
            totalCount={visibleClients.length}
            page={clampedPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
