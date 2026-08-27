import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MuiButton from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCurrency } from "../../lib/format.js";
import { Button } from "../../ui/Button.jsx";

function SummaryRow({ label, value, emphasis }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" className="credit-confirm__row">
      <Typography variant="body2" className="muted">{label}</Typography>
      <Typography variant={emphasis ? "subtitle1" : "body2"} fontWeight={emphasis ? 700 : 600}>
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * Last-look confirmation before a credit is sent to the backend. Shows the
 * operator exactly what will be registered and an estimated payoff so a
 * typo (an extra zero on the amount, the wrong term) gets caught here
 * instead of after the client has already been notified by email.
 */
export function CreditConfirmDialog({ open, credit, monthlyPayment, totalToPay, salespersonLabel, onCancel, onConfirm, isSubmitting, mode = "create" }) {
  if (!credit) return null;
  const isEdit = mode === "edit";

  const fullName = [credit.clientFirstName, credit.clientSecondName, credit.clientFirstSurname, credit.clientSecondSurname]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs" className="credit-form-dialog">
      <DialogTitle className="credit-form__title">
        <Stack spacing={0.5} className="credit-form__title-copy">
          <Typography variant="overline">{isEdit ? "Confirmar cambios" : "Confirmar registro"}</Typography>
          <Typography variant="h5">¿Todo correcto?</Typography>
          <Typography variant="body2" className="muted">
            {isEdit
              ? "Revisa los datos antes de guardar los cambios del crédito."
              : "Revisa los datos antes de registrar. Una vez confirmado, se notifica al cliente por correo."}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers className="credit-form__content">
        <Stack spacing={1.5}>
          <SummaryRow label="Cliente" value={fullName} />
          <SummaryRow label="Cédula o ID" value={credit.clientDocument} />
          <SummaryRow label="Comercial" value={salespersonLabel} />
          <SummaryRow label="Valor del crédito" value={formatCurrency(credit.amount)} />
          <SummaryRow label="Tasa de interés mensual" value={`${credit.interestRate}%`} />
          <SummaryRow label="Plazo" value={`${credit.termMonths} meses`} />
          <SummaryRow label="Cuota mensual estimada" value={formatCurrency(monthlyPayment)} emphasis />
          <SummaryRow label="Total estimado a pagar" value={formatCurrency(totalToPay)} emphasis />
          <Typography variant="caption" className="muted">
            Cálculo estimado (amortización francesa, tasa mensual fija). El backend no lo almacena; sirve solo como referencia para el cliente.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions className="credit-form__actions">
        <MuiButton onClick={onCancel} color="inherit" disabled={isSubmitting}>
          Revisar datos
        </MuiButton>
        <Button onClick={onConfirm} loading={isSubmitting} loadingText={isEdit ? "Guardando..." : "Registrando..."}>
          {isEdit ? "Confirmar cambios" : "Confirmar y registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
