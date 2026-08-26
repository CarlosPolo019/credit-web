import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCurrency, formatDate } from "../../lib/format.js";

const FIELD_LABELS = {
  clientFirstName: "Primer nombre",
  clientSecondName: "Segundo nombre",
  clientFirstSurname: "Primer apellido",
  clientSecondSurname: "Segundo apellido",
  clientDocument: "Cédula o ID",
  amount: "Valor del crédito",
  interestRate: "Tasa de interés mensual",
  termMonths: "Plazo",
};

const FIELD_FORMATTERS = {
  amount: (value) => formatCurrency(value),
  interestRate: (value) => `${value}%`,
  termMonths: (value) => `${value} meses`,
};

function formatFieldValue(field, value) {
  if (value === "" || value === null || value === undefined) return "(vacío)";
  const formatter = FIELD_FORMATTERS[field];
  return formatter ? formatter(value) : value;
}

function ChangeRow({ field, change }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 160 }}>
        {FIELD_LABELS[field] ?? field}
      </Typography>
      <Typography variant="body2" className="muted">{formatFieldValue(field, change.before)}</Typography>
      <Typography variant="body2" className="muted">→</Typography>
      <Typography variant="body2" fontWeight={600}>{formatFieldValue(field, change.after)}</Typography>
    </Stack>
  );
}

function AuditEntryRow({ entry }) {
  const isDeleted = entry.action === "DELETED";
  const changeFields = Object.keys(entry.changes ?? {});
  return (
    <Stack spacing={1} className="credit-audit__entry">
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Chip
          label={isDeleted ? "Eliminado" : "Editado"}
          size="small"
          sx={{
            bgcolor: isDeleted ? "#fef2f2" : "rgba(0,210,128,0.12)",
            color: isDeleted ? "#dc2626" : "#047857",
            fontWeight: 700,
          }}
        />
        <Typography variant="body2" fontWeight={600}>{entry.changedByName || entry.changedByDocument}</Typography>
        <Typography variant="caption" className="muted">{formatDate(entry.changedAt)}</Typography>
      </Stack>
      {isDeleted ? null : (
        <Stack spacing={0.5} sx={{ pl: 0.5 }}>
          {changeFields.map((field) => (
            <ChangeRow key={field} field={field} change={entry.changes[field]} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export function CreditAuditHistory({ entries, isLoading }) {
  if (isLoading) {
    return <Typography variant="body2" className="muted">Cargando historial...</Typography>;
  }
  if (!entries.length) {
    return <Typography variant="body2" className="muted">Sin cambios registrados todavía.</Typography>;
  }
  return (
    <Stack spacing={2} divider={<span className="credit-audit__divider" />}>
      {entries.map((entry) => (
        <AuditEntryRow key={entry.id} entry={entry} />
      ))}
    </Stack>
  );
}
