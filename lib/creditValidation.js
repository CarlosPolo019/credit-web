export const creditLimits = {
  clientFirstName: 60,
  clientSecondName: 60,
  clientFirstSurname: 60,
  clientSecondSurname: 60,
  clientDocument: 20,
};

const numericDocumentPattern = /^\d+$/;

export function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateCreditForm(values) {
  const errors = {};
  const clientFirstName = normalizeText(values.clientFirstName);
  const clientSecondName = normalizeText(values.clientSecondName);
  const clientFirstSurname = normalizeText(values.clientFirstSurname);
  const clientSecondSurname = normalizeText(values.clientSecondSurname);
  const clientDocument = normalizeText(values.clientDocument);
  const amount = Number(values.amount);
  const interestRate = Number(values.interestRate);
  const termMonths = Number(values.termMonths);

  if (!clientFirstName) errors.clientFirstName = "El primer nombre es obligatorio.";
  if (clientFirstName.length > creditLimits.clientFirstName) errors.clientFirstName = "Máximo 60 caracteres.";
  if (clientSecondName.length > creditLimits.clientSecondName) errors.clientSecondName = "Máximo 60 caracteres.";
  if (!clientFirstSurname) errors.clientFirstSurname = "El primer apellido es obligatorio.";
  if (clientFirstSurname.length > creditLimits.clientFirstSurname) errors.clientFirstSurname = "Máximo 60 caracteres.";
  if (clientSecondSurname.length > creditLimits.clientSecondSurname) errors.clientSecondSurname = "Máximo 60 caracteres.";
  if (!clientDocument) errors.clientDocument = "La cédula o ID es obligatoria.";
  if (clientDocument && !numericDocumentPattern.test(clientDocument)) errors.clientDocument = "La cédula o ID debe contener solo números.";
  if (clientDocument.length > creditLimits.clientDocument) errors.clientDocument = "Máximo 20 caracteres.";
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = "El valor debe ser mayor que cero.";
  if (!Number.isFinite(interestRate) || interestRate < 0) errors.interestRate = "La tasa no puede ser negativa.";
  if (!Number.isInteger(termMonths) || termMonths <= 0) errors.termMonths = "El plazo debe ser mayor que cero.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      clientFirstName,
      clientSecondName,
      clientFirstSurname,
      clientSecondSurname,
      clientDocument,
      amount,
      interestRate,
      termMonths,
    },
  };
}

export function normalizeSort(value) {
  return value === "amount" ? "amount" : "createdAt";
}

export function normalizeDirection(value) {
  return value === "asc" ? "asc" : "desc";
}
