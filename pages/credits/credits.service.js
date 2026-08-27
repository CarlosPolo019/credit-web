import { request, requestBlob } from "../../api/client.js";
import { normalizeDirection, normalizeSort } from "../../lib/creditValidation.js";

export async function createCredit(payload) {
  return request("/api/v1/credits", {
    method: "POST",
    body: payload,
  });
}

/**
 * All clients (document + name), used by the credit form's cédula
 * autocomplete and by the read-only Clientes page. Small dataset — no
 * server-side search/pagination, filtering happens in the client.
 */
export async function listClients(options = {}) {
  return request("/api/v1/clients", { signal: options.signal });
}

/**
 * Estimated monthly installment/total payoff, computed by the backend
 * (same formula it uses for CreditResponse and the PDF export) without
 * saving anything — used for the pre-submission confirmation step.
 */
export async function estimateCredit({ amount, interestRate, termMonths }) {
  return request("/api/v1/credits/estimate", {
    method: "POST",
    body: { amount, interestRate, termMonths },
  });
}

export async function listCredits(filters, options = {}) {
  const params = new URLSearchParams();
  if (filters.clientName) params.set("clientName", filters.clientName);
  if (filters.clientDocument) params.set("clientDocument", filters.clientDocument);
  if (filters.salesperson) params.set("salesperson", filters.salesperson);
  params.set("sortBy", normalizeSort(filters.sortBy));
  params.set("direction", normalizeDirection(filters.direction));
  return request(`/api/v1/credits?${params.toString()}`, { signal: options.signal });
}

export async function getCredit(id, options = {}) {
  return request(`/api/v1/credits/${id}`, { signal: options.signal });
}

export async function updateCredit(id, payload) {
  return request(`/api/v1/credits/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteCredit(id) {
  return request(`/api/v1/credits/${id}`, {
    method: "DELETE",
  });
}

export async function getCreditAudit(id, options = {}) {
  return request(`/api/v1/credits/${id}/audit`, { signal: options.signal });
}

/**
 * Downloads the credit's PDF certificate — rendered server-side by
 * credit-backend (same endpoint credit-mobile uses), so there's a single
 * implementation of the PDF layout instead of a duplicate client-side one.
 */
export async function downloadCreditPdf(id) {
  const blob = await requestBlob(`/api/v1/credits/${id}/pdf`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `credito-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
