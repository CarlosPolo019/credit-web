import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { validateCreditForm } from "../../lib/creditValidation.js";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";

const initialValues = {
  clientName: "",
  clientDocument: "",
  amount: "",
  interestRate: "2",
  termMonths: "",
  salespersonName: "",
};

export function CreditForm({ onSubmit, isSubmitting }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCreditForm(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    const ok = await onSubmit(validation.value);
    if (ok) {
      setValues(initialValues);
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Typography variant="h5">Registrar crédito</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Input label="Nombre del cliente" name="clientName" value={values.clientName} onChange={handleChange} error={Boolean(errors.clientName)} helperText={errors.clientName} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input label="Cédula o ID" name="clientDocument" value={values.clientDocument} onChange={handleChange} error={Boolean(errors.clientDocument)} helperText={errors.clientDocument} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input label="Valor del crédito" name="amount" type="number" value={values.amount} onChange={handleChange} error={Boolean(errors.amount)} helperText={errors.amount} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input label="Tasa de interés" name="interestRate" type="number" value={values.interestRate} onChange={handleChange} error={Boolean(errors.interestRate)} helperText={errors.interestRate} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input label="Plazo en meses" name="termMonths" type="number" value={values.termMonths} onChange={handleChange} error={Boolean(errors.termMonths)} helperText={errors.termMonths} required />
          </Grid>
          <Grid item xs={12}>
            <Input label="Comercial" name="salespersonName" value={values.salespersonName} onChange={handleChange} error={Boolean(errors.salespersonName)} helperText={errors.salespersonName} required />
          </Grid>
        </Grid>
        <Button type="submit" loading={isSubmitting} loadingText="Registrando...">
          Registrar crédito
        </Button>
      </Stack>
    </form>
  );
}
