export const creditLimits = {
  clientFirstName: 60,
  clientSecondName: 60,
  clientFirstSurname: 60,
  clientSecondSurname: 60,
  clientDocument: 20,
  // Mirrors credit-backend's CreditLimits (dto/request/CreditLimits.java) —
  // keep both in sync. Bounded like a real consumer-credit product: monthly
  // rate on a personal loan, term capped like a bank caps unsecured
  // lending, max loan size a flat business rule.
  minAmount: 0,
  maxAmount: 200_000_000,
  minInterestRate: 0.5,
  maxInterestRate: 3.5,
  minTermMonths: 1,
  maxTermMonths: 60,
};

const numericDocumentPattern = /^\d+$/;

export function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateCreditTerms(values) {
  const errors = {};
  const amount = Number(values.amount);
  const interestRate = Number(values.interestRate);
  const termMonths = Number(values.termMonths);

  if (!Number.isFinite(amount) || amount <= creditLimits.minAmount) {
    errors.amount = "El valor debe ser mayor que cero.";
  } else if (amount > creditLimits.maxAmount) {
    errors.amount = `El valor del crédito no puede superar ${creditLimits.maxAmount.toLocaleString("es-CO")}.`;
  }
  if (!Number.isFinite(interestRate) || interestRate < creditLimits.minInterestRate) {
    errors.interestRate = `La tasa de interés mensual debe ser de al menos ${creditLimits.minInterestRate}%.`;
  } else if (interestRate > creditLimits.maxInterestRate) {
    errors.interestRate = `La tasa de interés mensual no puede superar ${creditLimits.maxInterestRate}%.`;
  }
  if (!Number.isInteger(termMonths) || termMonths < creditLimits.minTermMonths) {
    errors.termMonths = `El plazo debe ser de al menos ${creditLimits.minTermMonths} mes.`;
  } else if (termMonths > creditLimits.maxTermMonths) {
    errors.termMonths = `El plazo no puede superar ${creditLimits.maxTermMonths} meses.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { amount, interestRate, termMonths },
  };
}

export function validateCreditForm(values) {
  const errors = {};
  const clientFirstName = normalizeText(values.clientFirstName);
  const clientSecondName = normalizeText(values.clientSecondName);
  const clientFirstSurname = normalizeText(values.clientFirstSurname);
  const clientSecondSurname = normalizeText(values.clientSecondSurname);
  const clientDocument = normalizeText(values.clientDocument);
  const terms = validateCreditTerms(values);

  if (!clientFirstName) errors.clientFirstName = "El primer nombre es obligatorio.";
  if (clientFirstName.length > creditLimits.clientFirstName) errors.clientFirstName = "Máximo 60 caracteres.";
  if (clientSecondName.length > creditLimits.clientSecondName) errors.clientSecondName = "Máximo 60 caracteres.";
  if (!clientFirstSurname) errors.clientFirstSurname = "El primer apellido es obligatorio.";
  if (clientFirstSurname.length > creditLimits.clientFirstSurname) errors.clientFirstSurname = "Máximo 60 caracteres.";
  if (clientSecondSurname.length > creditLimits.clientSecondSurname) errors.clientSecondSurname = "Máximo 60 caracteres.";
  if (!clientDocument) errors.clientDocument = "La cédula o ID es obligatoria.";
  if (clientDocument && !numericDocumentPattern.test(clientDocument)) errors.clientDocument = "La cédula o ID debe contener solo números.";
  if (clientDocument.length > creditLimits.clientDocument) errors.clientDocument = "Máximo 20 caracteres.";
  Object.assign(errors, terms.errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      clientFirstName,
      clientSecondName,
      clientFirstSurname,
      clientSecondSurname,
      clientDocument,
      ...terms.value,
    },
  };
}

export function normalizeSort(value) {
  return value === "amount" ? "amount" : "createdAt";
}

export function normalizeDirection(value) {
  return value === "asc" ? "asc" : "desc";
}
