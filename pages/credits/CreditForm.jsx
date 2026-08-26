import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { validateCreditForm } from "../../lib/creditValidation.js";
import { Button } from "../../ui/Button.jsx";
import { Input } from "../../ui/Input.jsx";

const initialValues = {
  clientFirstName: "",
  clientSecondName: "",
  clientFirstSurname: "",
  clientSecondSurname: "",
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
    const nextValue = name === "clientDocument" ? value.replace(/\D/g, "") : value;
    setValues((previous) => ({ ...previous, [name]: nextValue }));
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
          <Grid item xs={12} sm={6} md={3}>
            <Input label="Primer nombre" name="clientFirstName" value={values.clientFirstName} onChange={handleChange} error={Boolean(errors.clientFirstName)} helperText={errors.clientFirstName} required />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Input label="Segundo nombre" name="clientSecondName" value={values.clientSecondName} onChange={handleChange} error={Boolean(errors.clientSecondName)} helperText={errors.clientSecondName} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Input label="Primer apellido" name="clientFirstSurname" value={values.clientFirstSurname} onChange={handleChange} error={Boolean(errors.clientFirstSurname)} helperText={errors.clientFirstSurname} required />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Input label="Segundo apellido" name="clientSecondSurname" value={values.clientSecondSurname} onChange={handleChange} error={Boolean(errors.clientSecondSurname)} helperText={errors.clientSecondSurname} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input label="Cédula o ID" name="clientDocument" value={values.clientDocument} onChange={handleChange} error={Boolean(errors.clientDocument)} helperText={errors.clientDocument} required slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }} />
          </Grid>
          <Grid item xs={12} md={6}>
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
