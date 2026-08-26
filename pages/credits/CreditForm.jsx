import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { validateCreditForm } from "../../lib/creditValidation.js";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";
import { CreditConfirmDialog } from "./CreditConfirmDialog.jsx";

const initialValues = {
  clientFirstName: "",
  clientSecondName: "",
  clientFirstSurname: "",
  clientSecondSurname: "",
  clientDocument: "",
  amount: "",
  interestRate: "2",
  termMonths: "",
};

const FORM_ID = "credit-create-form";

export function CreditForm({ currentUser, onSubmit, onCancel, isSubmitting, error }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // Holds the validated payload while the operator reviews the confirmation
  // step; null means "no confirmation pending", not "empty form".
  const [pendingCredit, setPendingCredit] = useState(null);
  const salespersonLabel = currentUser?.fullName || currentUser?.document || currentUser?.username || "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "clientDocument" ? value.replace(/\D/g, "") : value;
    setValues((previous) => ({ ...previous, [name]: nextValue }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateCreditForm(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setPendingCredit(validation.value);
  };

  const handleConfirm = async () => {
    const ok = await onSubmit(pendingCredit);
    // Either way, drop back to the form: on success it resets for the next
    // entry; on failure the entered values stay so the operator sees the
    // error banner and can retry without retyping everything.
    setPendingCredit(null);
    if (ok) {
      setValues(initialValues);
      setErrors({});
    }
  };

  return (
    <>
      <DialogTitle className="credit-form__title">
        <Stack spacing={0.5} className="credit-form__title-copy">
          <Typography variant="overline">Nuevo registro</Typography>
          <Typography variant="h5">Registrar crédito</Typography>
          <Typography variant="body2" className="muted">
            Completa los datos del cliente y las condiciones para dejarlo registrado y notificado.
          </Typography>
        </Stack>
        <IconButton onClick={onCancel} aria-label="Cerrar" className="credit-form__close" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="credit-form__content">
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} className="credit-form__section-label">
                <span className="credit-form__section-index">01</span>
                <Typography variant="overline">Datos del cliente</Typography>
              </Stack>
              <Grid container spacing={2} className="credit-form__grid">
                <Grid size={12}>
                  <Input label="Cédula o ID" name="clientDocument" value={values.clientDocument} onChange={handleChange} error={Boolean(errors.clientDocument)} helperText={errors.clientDocument} required autoFocus slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Primer nombre" name="clientFirstName" value={values.clientFirstName} onChange={handleChange} error={Boolean(errors.clientFirstName)} helperText={errors.clientFirstName} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Segundo nombre" name="clientSecondName" value={values.clientSecondName} onChange={handleChange} error={Boolean(errors.clientSecondName)} helperText={errors.clientSecondName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Primer apellido" name="clientFirstSurname" value={values.clientFirstSurname} onChange={handleChange} error={Boolean(errors.clientFirstSurname)} helperText={errors.clientFirstSurname} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Segundo apellido" name="clientSecondSurname" value={values.clientSecondSurname} onChange={handleChange} error={Boolean(errors.clientSecondSurname)} helperText={errors.clientSecondSurname} />
                </Grid>
              </Grid>
            </Box>

            <Divider className="credit-form__divider" />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} className="credit-form__section-label">
                <span className="credit-form__section-index">02</span>
                <Typography variant="overline">Condiciones del crédito</Typography>
              </Stack>
              <Grid container spacing={2} className="credit-form__grid">
                <Grid size={12}>
                  <Input label="Valor del crédito" name="amount" type="number" value={values.amount} onChange={handleChange} error={Boolean(errors.amount)} helperText={errors.amount} required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Input
                    label="Tasa de interés mensual"
                    name="interestRate"
                    type="number"
                    value={values.interestRate}
                    onChange={handleChange}
                    error={Boolean(errors.interestRate)}
                    helperText={errors.interestRate}
                    required
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Input
                    label="Plazo"
                    name="termMonths"
                    type="number"
                    value={values.termMonths}
                    onChange={handleChange}
                    error={Boolean(errors.termMonths)}
                    helperText={errors.termMonths}
                    required
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">meses</InputAdornment> } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </form>
      </DialogContent>

      {error ? <div className="form-error credit-form__error">{error}</div> : null}

      <DialogActions className="credit-form__actions">
        <MuiButton onClick={onCancel} color="inherit">
          Cancelar
        </MuiButton>
        <Button type="submit" form={FORM_ID}>
          Registrar crédito
        </Button>
      </DialogActions>

      <CreditConfirmDialog
        open={Boolean(pendingCredit)}
        credit={pendingCredit}
        salespersonLabel={salespersonLabel}
        onCancel={() => setPendingCredit(null)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
