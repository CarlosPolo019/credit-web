import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { formatCurrency, formatDate } from "../../lib/format.js";
import { Button } from "../../ui/Button.jsx";
import { Card } from "../../ui/Card.jsx";
import { DataTable } from "../../ui/DataTable.jsx";
import { Input } from "../../ui/Input.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { creditColumns } from "./credits.columns.js";
import { createCredit, deleteCredit, listCredits } from "./credits.service.js";
import { CreditForm } from "./CreditForm.jsx";
import { DeleteCreditDialog } from "./DeleteCreditDialog.jsx";

const defaultFilters = {
  clientName: "",
  clientDocument: "",
  salesperson: "",
  sortBy: "createdAt",
  direction: "desc",
};

function clientDisplayName(row) {
  const derivedName = [
    row.clientFirstName,
    row.clientSecondName,
    row.clientFirstSurname,
    row.clientSecondSurname,
  ].filter(Boolean).join(" ");
  return row.clientName || derivedName || "-";
}

export function CreditsPage() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("sm"));
  const [filters, setFilters] = useState(defaultFilters);
  const [credits, setCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingCredit, setDeletingCredit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingCreditId, setRemovingCreditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const latestRequestId = useRef(0);

  const loadCredits = useCallback(async (options = {}) => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError("");
    try {
      const response = await listCredits(filters, { signal: options.signal });
      if (requestId === latestRequestId.current) {
        setCredits(response.items ?? []);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (requestId === latestRequestId.current) {
        setCredits([]);
        setError(err.message || "No se pudieron cargar los créditos.");
      }
    } finally {
      if (!options.signal?.aborted && requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  const openCreditDetail = useCallback((credit) => {
    navigate(`/credits/${credit.id}`, { state: { credit } });
  }, [navigate]);

  const openCreditEdit = useCallback((credit) => {
    navigate(`/credits/${credit.id}?edit=1`, { state: { credit } });
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadCredits({ signal: controller.signal });
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [loadCredits]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "clientDocument" ? value.replace(/\D/g, "") : value;
    setFilters((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleSortChange = (sortKey) => {
    setFilters((previous) => ({
      ...previous,
      sortBy: sortKey,
      direction: previous.sortBy === sortKey && previous.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleCreate = async (payload) => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await createCredit(payload);
      setSuccess("Crédito registrado. La notificación fue encolada para envío.");
      setIsFormOpen(false);
      await loadCredits();
      return true;
    } catch (err) {
      setError(err.message || "No se pudo registrar el crédito.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const deletedId = deletingCredit.id;
      await deleteCredit(deletedId);
      setSuccess("Crédito eliminado.");
      setDeletingCredit(null);
      // Let the row fade out in place before the refetch removes it, so the
      // deletion reads as a change the operator can see rather than a jump-cut.
      setRemovingCreditId(deletedId);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      await loadCredits();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el crédito.");
    } finally {
      setIsDeleting(false);
      setRemovingCreditId(null);
    }
  };

  const renderCell = (row, key) => {
    if (key === "clientName") return <PersonChip name={clientDisplayName(row)} size={28} />;
    if (key === "amount") return formatCurrency(row.amount);
    if (key === "interestRate") return `${row.interestRate}%`;
    if (key === "termMonths") return `${row.termMonths} meses`;
    if (key === "createdAt") return formatDate(row.createdAt);
    if (key === "salespersonName") return <PersonChip name={row.salespersonName} size={28} />;
    if (key === "actions") {
      return (
        <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
          <Tooltip title="Ver más">
            <IconButton size="small" onClick={() => openCreditDetail(row)}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openCreditEdit(row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => setDeletingCredit(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    }
    return row[key] ?? "-";
  };

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title page-title--with-action">
        <Box>
          <Typography variant="overline" className="section-badge">Créditos</Typography>
          <Typography variant="h4">Registro y <span className="text-accent">consulta</span></Typography>
        </Box>
        <Button onClick={() => setIsFormOpen(true)} startIcon={<AddOutlinedIcon />}>
          Registrar crédito
        </Button>
      </Box>

      <Collapse in={Boolean(error)} unmountOnExit>
        <div className="alert alert--error">{error}</div>
      </Collapse>
      <Collapse in={Boolean(success)} unmountOnExit>
        <div className="alert alert--success">{success}</div>
      </Collapse>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isCompact}
        className="credit-form-dialog"
      >
        <CreditForm
          currentUser={state.user}
          onSubmit={handleCreate}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={isSaving}
          error={error}
        />
      </Dialog>

      <DeleteCreditDialog
        open={Boolean(deletingCredit)}
        clientName={deletingCredit ? clientDisplayName(deletingCredit) : ""}
        onCancel={() => setDeletingCredit(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <Card className="admin-card--padded">
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">Consultar créditos</Typography>
              <Typography variant="body2" className="muted">Solo se muestran créditos activos.</Typography>
            </Box>
            <Button variant="outlined" onClick={loadCredits} disabled={isLoading} startIcon={<RefreshIcon />}>
              Actualizar
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Input label="Nombre cliente" name="clientName" value={filters.clientName} onChange={handleFilterChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Input label="Cédula / ID" name="clientDocument" value={filters.clientDocument} onChange={handleFilterChange} slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Input label="Comercial" name="salesperson" value={filters.salesperson} onChange={handleFilterChange} />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <Input select label="Orden" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                <MenuItem value="createdAt">Fecha</MenuItem>
                <MenuItem value="amount">Valor</MenuItem>
              </Input>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <Input select label="Dirección" name="direction" value={filters.direction} onChange={handleFilterChange}>
                <MenuItem value="desc">Desc</MenuItem>
                <MenuItem value="asc">Asc</MenuItem>
              </Input>
            </Grid>
          </Grid>
          <DataTable
            columns={creditColumns}
            rows={credits}
            getRowId={(row) => row.id}
            renderCell={renderCell}
            isLoading={isLoading}
            sortBy={filters.sortBy}
            direction={filters.direction}
            onSortChange={handleSortChange}
            onRowClick={openCreditDetail}
            removingRowId={removingCreditId}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
