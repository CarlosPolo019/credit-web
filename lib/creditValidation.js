export const creditLimits = {
  clientName: 120,
  clientDocument: 40,
  salespersonName: 120,
};

export function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateCreditForm(values) {
  const errors = {};
  const clientName = normalizeText(values.clientName);
  const clientDocument = normalizeText(values.clientDocument);
  const salespersonName = normalizeText(values.salespersonName);
  const amount = Number(values.amount);
  const interestRate = Number(values.interestRate);
  const termMonths = Number(values.termMonths);

  if (!clientName) errors.clientName = "El nombre del cliente es obligatorio.";
  if (clientName.length > creditLimits.clientName) errors.clientName = "Máximo 120 caracteres.";
  if (!clientDocument) errors.clientDocument = "La cédula o ID es obligatoria.";
  if (clientDocument.length > creditLimits.clientDocument) errors.clientDocument = "Máximo 40 caracteres.";
  if (!salespersonName) errors.salespersonName = "El comercial es obligatorio.";
  if (salespersonName.length > creditLimits.salespersonName) errors.salespersonName = "Máximo 120 caracteres.";
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = "El valor debe ser mayor que cero.";
  if (!Number.isFinite(interestRate) || interestRate < 0) errors.interestRate = "La tasa no puede ser negativa.";
  if (!Number.isInteger(termMonths) || termMonths <= 0) errors.termMonths = "El plazo debe ser mayor que cero.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      clientName,
      clientDocument,
      amount,
      interestRate,
      termMonths,
      salespersonName,
    },
  };
}

export function normalizeSort(value) {
  return value === "amount" ? "amount" : "createdAt";
}

export function normalizeDirection(value) {
  return value === "asc" ? "asc" : "desc";
}
