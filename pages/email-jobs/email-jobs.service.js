import { request } from "../../api/client.js";

function normalizeSort(value) {
  return value === "status" ? "status" : "createdAt";
}

function normalizeDirection(value) {
  return value === "asc" ? "asc" : "desc";
}

export async function listEmailJobs(filters, options = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  params.set("sortBy", normalizeSort(filters.sortBy));
  params.set("direction", normalizeDirection(filters.direction));
  return request(`/api/v1/email-jobs?${params.toString()}`, { signal: options.signal });
}
