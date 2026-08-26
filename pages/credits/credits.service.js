import { request } from "../../api/client.js";
import { normalizeDirection, normalizeSort } from "../../lib/creditValidation.js";

export async function createCredit(payload) {
  return request("/api/v1/credits", {
    method: "POST",
    body: payload,
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
