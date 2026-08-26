import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import MuiButton from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { estimateCreditPayment } from "../../lib/creditPayment.js";
import { formatCurrency, formatDate } from "../../lib/format.js";
import { Card } from "../../ui/Card.jsx";
import { PersonChip } from "../../ui/PersonAvatar.jsx";
import { CreditAuditHistory } from "./CreditAuditHistory.jsx";
import { CreditForm } from "./CreditForm.jsx";
import { DeleteCreditDialog } from "./DeleteCreditDialog.jsx";
import { deleteCredit, getCredit, getCreditAudit, updateCredit } from "./credits.service.js";
import { exportCreditPdf } from "./creditPdf.js";

function clientDisplayName(credit) {
  const derivedName = [
    credit.clientFirstName,
    credit.clientSecondName,
    credit.clientFirstSurname,
    credit.clientSecondSurname,
  ].filter(Boolean).join(" ");
  return credit.clientName || derivedName || "-";
}

function DetailRow({ label, value, emphasis }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" className="muted credit-detail__label">{label}</Typography>
      <Typography variant={emphasis ? "h6" : "body1"} fontWeight={emphasis ? 700 : 600}>
        {value}
      </Typography>
    </Stack>
  );
}

export function CreditDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credit, setCredit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formError, setFormError] = useState("");
  const [auditEntries, setAuditEntries] = useState([]);
  const [isAuditLoading, setIsAuditLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getCredit(id);
      setCredit(response);
    } catch (err) {
      setError(err.message || "No se pudo cargar el crédito.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadAudit = useCallback(async () => {
    setIsAuditLoading(true);
    try {
      const response = await getCreditAudit(id);
      setAuditEntries(response ?? []);
    } catch {
      setAuditEntries([]);
    } finally {
      setIsAuditLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    void loadAudit();
  }, [load, loadAudit]);

  const handleUpdate = async (payload) => {
    setIsSaving(true);
    setFormError("");
    try {
      const response = await updateCredit(id, payload);
      setCredit(response);
      setIsEditOpen(false);
      await loadAudit();
      return true;
    } catch (err) {
      setFormError(err.message || "No se pudo guardar el crédito.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCredit(id);
      navigate("/credits", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo eliminar el crédito.");
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCreditPdf(credit);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <Typography className="muted">Cargando crédito...</Typography>;
  }

  if (error && !credit) {
    return (
      <Stack spacing={2}>
        <div className="alert alert--error">{error}</div>
        <MuiButton component={Link} to="/credits" startIcon={<ArrowBackIcon />} color="inherit" sx={{ width: "fit-content" }}>
          Volver a créditos
        </MuiButton>
      </Stack>
    );
  }

  if (!credit) return null;

  const { monthlyPayment, totalToPay } = estimateCreditPayment(credit);

  return (
    <Stack spacing={3} className="credits-page">
      <Box>
        <MuiButton component={Link} to="/credits" startIcon={<ArrowBackIcon />} color="inherit" size="small" sx={{ mb: 1.5, pl: 0 }}>
          Créditos
        </MuiButton>
        <Box className="page-title page-title--with-action">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="overline" className="section-badge">Detalle de crédito</Typography>
              <Chip
                label={credit.isActive === false ? "Inactivo" : "Activo"}
                size="small"
                sx={{
                  bgcolor: credit.isActive === false ? "#fef2f2" : "rgba(0,210,128,0.12)",
                  color: credit.isActive === false ? "#dc2626" : "#047857",
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Typography variant="h4">{clientDisplayName(credit)}</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <MuiButton variant="outlined" color="inherit" startIcon={<DownloadIcon />} onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Generando..." : "Exportar PDF"}
            </MuiButton>
            <MuiButton variant="outlined" color="inherit" startIcon={<EditOutlinedIcon />} onClick={() => setIsEditOpen(true)}>
              Editar
            </MuiButton>
            <MuiButton variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setIsDeleteOpen(true)}>
              Eliminar
            </MuiButton>
          </Stack>
        </Box>
      </Box>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <Card className="admin-card--padded credit-detail__hero">
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="caption" className="muted credit-detail__label">Valor del crédito</Typography>
            <Typography variant="h3" className="text-accent" fontWeight={800}>{formatCurrency(credit.amount)}</Typography>
          </Stack>
          <PersonChip name={credit.salespersonName} secondaryText="Comercial" size={40} />
        </Stack>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="admin-card--padded">
            <Stack spacing={2.5}>
              <Typography variant="h6">Cliente</Typography>
              <DetailRow label="Nombre completo" value={clientDisplayName(credit)} />
              <DetailRow label="Cédula o ID" value={credit.clientDocument} />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="admin-card--padded">
            <Stack spacing={2.5}>
              <Typography variant="h6">Condiciones</Typography>
              <Stack direction="row" spacing={4}>
                <DetailRow label="Tasa mensual" value={`${credit.interestRate}%`} />
                <DetailRow label="Plazo" value={`${credit.termMonths} meses`} />
              </Stack>
              <Stack direction="row" spacing={4}>
                <DetailRow label="Cuota mensual estimada" value={formatCurrency(monthlyPayment)} emphasis />
                <DetailRow label="Total estimado a pagar" value={formatCurrency(totalToPay)} emphasis />
              </Stack>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card className="admin-card--padded">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
              <DetailRow label="Fecha de registro" value={formatDate(credit.createdAt)} />
              <DetailRow label="Última actualización" value={formatDate(credit.updatedAt)} />
              <DetailRow label="ID del crédito" value={credit.id} />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card className="admin-card--padded">
            <Stack spacing={2}>
              <Typography variant="h6">Historial de cambios</Typography>
              <CreditAuditHistory entries={auditEntries} isLoading={isAuditLoading} />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm" className="credit-form-dialog">
        <CreditForm
          mode="edit"
          initialCredit={credit}
          currentUser={{ fullName: credit.salespersonName }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditOpen(false)}
          isSubmitting={isSaving}
          error={formError}
        />
      </Dialog>

      <DeleteCreditDialog
        open={isDeleteOpen}
        clientName={clientDisplayName(credit)}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Stack>
  );
}
