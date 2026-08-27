import CloseIcon from "@mui/icons-material/Close";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { creditLimits, validateCreditForm } from "../../lib/creditValidation.js";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";
import { CreditConfirmDialog } from "./CreditConfirmDialog.jsx";
import { estimateCredit, listClients } from "./credits.service.js";

const clientFilterOptions = createFilterOptions({ stringify: (option) => option.document });

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

export function CreditForm({ currentUser, onSubmit, onCancel, isSubmitting, error, mode = "create", initialCredit }) {
  const isEdit = mode === "edit";
  const [values, setValues] = useState(() => (isEdit && initialCredit ? { ...initialValues, ...initialCredit } : initialValues));
  const [errors, setErrors] = useState({});
  // Holds the validated payload while the operator reviews the confirmation
  // step; null means "no confirmation pending", not "empty form".
  const [pendingCredit, setPendingCredit] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const salespersonLabel = currentUser?.fullName || currentUser?.document || currentUser?.username || "";

  // Only the create flow benefits from the autocomplete — an existing
  // credit's client is already identified, editing stays as-is.
  useEffect(() => {
    if (isEdit) return;
    let cancelled = false;
    listClients()
      .then((items) => {
        if (!cancelled) setClients(items ?? []);
      })
      .catch(() => {
        // Non-fatal: the field just behaves as a plain text input.
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const handleClientInputChange = (_event, newInputValue, reason) => {
    if (reason !== "input") return;
    const digits = newInputValue.replace(/\D/g, "");
    setValues((previous) => ({
      ...previous,
      clientDocument: digits,
      ...(selectedClient
        ? { clientFirstName: "", clientSecondName: "", clientFirstSurname: "", clientSecondSurname: "" }
        : {}),
    }));
    setErrors((previous) => ({ ...previous, clientDocument: "" }));
    setSelectedClient(null);
  };

  const handleClientSelect = (_event, newValue) => {
    if (newValue && typeof newValue === "object") {
      setSelectedClient(newValue);
      setValues((previous) => ({
        ...previous,
        clientDocument: newValue.document,
        clientFirstName: newValue.firstName || "",
        clientSecondName: newValue.secondName || "",
        clientFirstSurname: newValue.firstSurname || "",
        clientSecondSurname: newValue.secondSurname || "",
      }));
      setErrors((previous) => ({
        ...previous,
        clientDocument: "",
        clientFirstName: "",
        clientSecondName: "",
        clientFirstSurname: "",
        clientSecondSurname: "",
      }));
    } else {
      setSelectedClient(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "clientDocument" ? value.replace(/\D/g, "") : value;
    setValues((previous) => ({ ...previous, [name]: nextValue }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  // Digits-only, clamped to the max so it's impossible to end up with a
  // value the backend would reject anyway — same idea as an input mask.
  // Stored as plain digits (no "$"/"." formatting) so validateCreditForm
  // and estimateCredit keep receiving exactly what they got before.
  const handleAmountChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    const nextValue = digits === "" ? "" : String(Math.min(Number(digits), creditLimits.maxAmount));
    setValues((previous) => ({ ...previous, amount: nextValue }));
    setErrors((previous) => ({ ...previous, amount: "" }));
  };

  const handleTermMonthsChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    const nextValue = digits === "" ? "" : String(Math.min(Number(digits), creditLimits.maxTermMonths));
    setValues((previous) => ({ ...previous, termMonths: nextValue }));
    setErrors((previous) => ({ ...previous, termMonths: "" }));
  };

  const handleInterestRateChange = (event) => {
    let cleaned = event.target.value.replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    // A trailing "." (or an empty field) is a mid-typing state — don't
    // clamp yet, or "3." would jump to "3.5" before the user can type the
    // decimals.
    if (cleaned !== "" && !cleaned.endsWith(".")) {
      const numeric = Number(cleaned);
      if (Number.isFinite(numeric) && numeric > creditLimits.maxInterestRate) {
        cleaned = String(creditLimits.maxInterestRate);
      }
    }
    setValues((previous) => ({ ...previous, interestRate: cleaned }));
    setErrors((previous) => ({ ...previous, interestRate: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCreditForm(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setEstimateError("");
    setIsEstimating(true);
    try {
      const response = await estimateCredit(validation.value);
      setEstimate(response);
      setPendingCredit(validation.value);
    } catch (err) {
      setEstimateError(err.message || "No se pudo calcular la cuota estimada.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleConfirm = async () => {
    const ok = await onSubmit(pendingCredit);
    // Either way, drop back to the form: on success it resets for the next
    // entry; on failure the entered values stay so the operator sees the
    // error banner and can retry without retyping everything.
    setPendingCredit(null);
    if (ok && !isEdit) {
      setValues(initialValues);
      setErrors({});
      setSelectedClient(null);
    }
  };

  return (
    <>
      <DialogTitle className="credit-form__title">
        <Stack spacing={0.5} className="credit-form__title-copy">
          <Typography variant="overline">{isEdit ? "Editar crédito" : "Nuevo registro"}</Typography>
          <Typography variant="h5">{isEdit ? "Editar crédito" : "Registrar crédito"}</Typography>
          <Typography variant="body2" className="muted">
            {isEdit
              ? "Ajusta los datos del cliente o las condiciones del crédito."
              : "Completa los datos del cliente y las condiciones para dejarlo registrado y notificado."}
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
                  {isEdit ? (
                    <Input label="Cédula o ID" name="clientDocument" value={values.clientDocument} onChange={handleChange} error={Boolean(errors.clientDocument)} helperText={errors.clientDocument} required autoFocus slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }} />
                  ) : (
                    <Autocomplete
                      freeSolo
                      options={clients}
                      value={selectedClient}
                      inputValue={values.clientDocument}
                      onInputChange={handleClientInputChange}
                      onChange={handleClientSelect}
                      filterOptions={clientFilterOptions}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        return typeof option === "string" ? option : `${option.document} — ${option.fullName}`;
                      }}
                      isOptionEqualToValue={(option, value) => option.document === value?.document}
                      renderInput={(params) => (
                        <Input
                          {...params}
                          label="Cédula o ID"
                          required
                          autoFocus
                          error={Boolean(errors.clientDocument)}
                          helperText={errors.clientDocument || "Si la cédula ya existe, el nombre se completa solo."}
                        />
                      )}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Primer nombre" name="clientFirstName" value={values.clientFirstName} onChange={handleChange} error={Boolean(errors.clientFirstName)} helperText={errors.clientFirstName} required disabled={Boolean(selectedClient)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Segundo nombre" name="clientSecondName" value={values.clientSecondName} onChange={handleChange} error={Boolean(errors.clientSecondName)} helperText={errors.clientSecondName} disabled={Boolean(selectedClient)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Primer apellido" name="clientFirstSurname" value={values.clientFirstSurname} onChange={handleChange} error={Boolean(errors.clientFirstSurname)} helperText={errors.clientFirstSurname} required disabled={Boolean(selectedClient)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input label="Segundo apellido" name="clientSecondSurname" value={values.clientSecondSurname} onChange={handleChange} error={Boolean(errors.clientSecondSurname)} helperText={errors.clientSecondSurname} disabled={Boolean(selectedClient)} />
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
                  <Input
                    label="Valor del crédito"
                    name="amount"
                    inputMode="numeric"
                    value={values.amount ? Number(values.amount).toLocaleString("es-CO") : ""}
                    onChange={handleAmountChange}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount || `Máximo $${creditLimits.maxAmount.toLocaleString("es-CO")}`}
                    required
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input
                    label="Tasa de interés mensual"
                    name="interestRate"
                    inputMode="decimal"
                    value={values.interestRate}
                    onChange={handleInterestRateChange}
                    error={Boolean(errors.interestRate)}
                    helperText={errors.interestRate || `Entre ${creditLimits.minInterestRate}% y ${creditLimits.maxInterestRate}%`}
                    required
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Input
                    label="Plazo"
                    name="termMonths"
                    inputMode="numeric"
                    value={values.termMonths}
                    onChange={handleTermMonthsChange}
                    error={Boolean(errors.termMonths)}
                    helperText={errors.termMonths || `Entre ${creditLimits.minTermMonths} y ${creditLimits.maxTermMonths} meses`}
                    required
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end">meses</InputAdornment> },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </form>
      </DialogContent>

      <Collapse in={Boolean(error || estimateError)} unmountOnExit>
        <div className="form-error credit-form__error">{error || estimateError}</div>
      </Collapse>

      <DialogActions className="credit-form__actions">
        <MuiButton onClick={onCancel} color="inherit">
          Cancelar
        </MuiButton>
        <Button type="submit" form={FORM_ID} loading={isEstimating} loadingText="Calculando...">
          {isEdit ? "Guardar cambios" : "Registrar crédito"}
        </Button>
      </DialogActions>

      <CreditConfirmDialog
        open={Boolean(pendingCredit)}
        credit={pendingCredit}
        monthlyPayment={estimate?.monthlyPayment}
        totalToPay={estimate?.totalToPay}
        salespersonLabel={salespersonLabel}
        onCancel={() => setPendingCredit(null)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
        mode={mode}
      />
    </>
  );
}
