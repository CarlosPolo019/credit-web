/**
 * Estimates the monthly installment and total payoff for a credit using the
 * French amortization method (fixed monthly payment). `interestRate` is
 * treated as a flat MONTHLY rate (matches how this product's seed data and
 * forms use it, e.g. "2" means 2% per month) — not annual.
 *
 * This is a client-side estimate for the operator to sanity-check before
 * submitting; the backend does not calculate or store it.
 */
export function estimateCreditPayment({ amount, interestRate, termMonths }) {
  const principal = Number(amount) || 0;
  const monthlyRate = (Number(interestRate) || 0) / 100;
  const months = Number(termMonths) || 0;

  if (principal <= 0 || months <= 0) {
    return { monthlyPayment: 0, totalToPay: 0 };
  }

  const monthlyPayment = monthlyRate === 0
    ? principal / months
    : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  return {
    monthlyPayment,
    totalToPay: monthlyPayment * months,
  };
}
