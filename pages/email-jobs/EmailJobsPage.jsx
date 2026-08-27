import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency, formatDate } from "../../lib/format.js";
import { Button } from "../../ui/Button.jsx";
import { Card } from "../../ui/Card.jsx";
import { DataTable } from "../../ui/DataTable.jsx";
import { Input } from "../../ui/Input.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { emailJobColumns } from "./email-jobs.columns.js";
import { listEmailJobs } from "./email-jobs.service.js";

const defaultFilters = {
  status: "",
  search: "",
  sortBy: "createdAt",
  direction: "desc",
};

const STATUS_META = {
  PENDING: { label: "Pendiente", color: "default" },
  PROCESSING: { label: "Procesando", color: "info" },
  SENT: { label: "Enviado", color: "success" },
  RETRY: { label: "Reintentando", color: "warning" },
  FAILED: { label: "Fallido", color: "error" },
};

function StatusChip({ status }) {
  const meta = STATUS_META[status] ?? { label: status, color: "default" };
  return <Chip size="small" label={meta.label} color={meta.color} variant={meta.color === "default" ? "outlined" : "filled"} />;
}

const PAGE_SIZE = 6;

export function EmailJobsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const latestRequestId = useRef(0);

  const loadJobs = useCallback(async (options = {}) => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError("");
    try {
      const response = await listEmailJobs(filters, { signal: options.signal });
      if (requestId === latestRequestId.current) {
        setJobs(response.items ?? []);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (requestId === latestRequestId.current) {
        setJobs([]);
        setError(err.message || "No se pudieron cargar los correos.");
      }
    } finally {
      if (!options.signal?.aborted && requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadJobs({ signal: controller.signal });
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [loadJobs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleSortChange = (sortKey) => {
    setFilters((previous) => ({
      ...previous,
      sortBy: sortKey,
      direction: previous.sortBy === sortKey && previous.direction === "desc" ? "asc" : "desc",
    }));
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [page, clampedPage]);

  const pagedJobs = useMemo(
    () => jobs.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE),
    [jobs, clampedPage],
  );

  const renderCell = (row, key) => {
    if (key === "recipient") {
      const showError = (row.status === "FAILED" || row.status === "RETRY") && row.lastError;
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2">{row.recipient}</Typography>
          {showError ? (
            <Tooltip title={row.lastError}>
              <Typography
                variant="caption"
                className="email-jobs__error"
                sx={{
                  maxWidth: { xs: "100%", sm: 260 },
                  overflow: { sm: "hidden" },
                  overflowWrap: "anywhere",
                  textOverflow: { sm: "ellipsis" },
                  whiteSpace: { xs: "normal", sm: "nowrap" },
                }}
              >
                {row.lastError}
              </Typography>
            </Tooltip>
          ) : null}
        </Stack>
      );
    }
    if (key === "clientName") return <PersonChip name={row.clientName} size={28} />;
    if (key === "creditAmount") return formatCurrency(row.creditAmount);
    if (key === "status") return <StatusChip status={row.status} />;
    if (key === "createdAt") return formatDate(row.createdAt);
    if (key === "nextAttemptAt") return formatDate(row.nextAttemptAt);
    return row[key] ?? "-";
  };

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title">
        <Typography variant="overline" className="section-badge">Notificaciones</Typography>
        <Typography variant="h4">Correos de <span className="text-accent">crédito</span></Typography>
      </Box>

      <Collapse in={Boolean(error)} unmountOnExit>
        <div className="alert alert--error">{error}</div>
      </Collapse>

      <Card className="admin-card--padded">
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">Estado de envíos</Typography>
              <Typography variant="body2" className="muted">Si un correo falla, el error aparece debajo del destinatario.</Typography>
            </Box>
            <Button variant="outlined" onClick={loadJobs} disabled={isLoading} startIcon={<RefreshIcon />}>
              Actualizar
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Buscar cliente o destinatario" name="search" value={filters.search} onChange={handleFilterChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Input select label="Estado" name="status" value={filters.status} onChange={handleFilterChange}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDING">Pendiente</MenuItem>
                <MenuItem value="PROCESSING">Procesando</MenuItem>
                <MenuItem value="SENT">Enviado</MenuItem>
                <MenuItem value="RETRY">Reintentando</MenuItem>
                <MenuItem value="FAILED">Fallido</MenuItem>
              </Input>
            </Grid>
          </Grid>
          <DataTable
            columns={emailJobColumns}
            rows={pagedJobs}
            getRowId={(row) => row.id}
            renderCell={renderCell}
            isLoading={isLoading}
            loadingText="Cargando correos..."
            countLabel="correos visibles"
            emptyText="No hay correos para mostrar."
            sortBy={filters.sortBy}
            direction={filters.direction}
            onSortChange={handleSortChange}
            totalCount={jobs.length}
            page={clampedPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
