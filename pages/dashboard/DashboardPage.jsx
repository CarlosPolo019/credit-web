import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listCredits } from "../credits/credits.service.js";
import { listEmailJobs } from "../email-jobs/email-jobs.service.js";
import { formatCurrency } from "../../lib/format.js";
import { Card } from "../../ui/Card.jsx";

// Fixed sort so both fetches ask for the whole active dataset in a stable
// order — same "fetch everything, aggregate in the browser" pattern already
// used by ClientsPage/CreditsPage/EmailJobsPage. No new backend endpoint.
const CREDIT_FETCH_PARAMS = { sortBy: "createdAt", direction: "desc" };
const EMAIL_JOB_FETCH_PARAMS = { sortBy: "createdAt", direction: "desc" };

// Stays inside the app's palette (ui/theme.js): SENT uses the brand primary
// green, FAILED the brand error red, and the three in-flight/non-final
// statuses get muted/warm tones so "successful vs. not" reads at a glance
// without introducing off-brand hues.
const STATUS_META = {
  SENT: { label: "Enviado", color: "#00d280" },
  FAILED: { label: "Fallido", color: "#dc2626" },
  RETRY: { label: "Reintentando", color: "#f59e0b" },
  PROCESSING: { label: "Procesando", color: "#6b7280" },
  PENDING: { label: "Pendiente", color: "#9ca3af" },
};
const STATUS_ORDER = ["SENT", "FAILED", "RETRY", "PROCESSING", "PENDING"];

function aggregateCreditsBySalesperson(credits) {
  const counts = new Map();
  for (const credit of credits) {
    const name = credit.salespersonName || "Sin comercial";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregateEmailJobsByStatus(jobs) {
  const counts = new Map();
  for (const job of jobs) {
    counts.set(job.status, (counts.get(job.status) ?? 0) + 1);
  }
  return STATUS_ORDER
    .map((status) => ({
      status,
      label: STATUS_META[status].label,
      color: STATUS_META[status].color,
      count: counts.get(status) ?? 0,
    }))
    .filter((entry) => entry.count > 0);
}

/**
 * Admin-only aggregate view: per-comercial credit counts, global totals
 * (monto solicitado / ganancia estimada) and an email-status breakdown.
 * Both source lists (`listCredits`, `listEmailJobs`) already return the full
 * active dataset with no server pagination — same assumption ClientsPage,
 * CreditsPage and EmailJobsPage rely on — so every number here is computed
 * client-side from those two fetches, no new backend endpoint.
 */
export function DashboardPage() {
  const [credits, setCredits] = useState([]);
  const [emailJobs, setEmailJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const latestRequestId = useRef(0);

  const loadDashboard = useCallback(async (options = {}) => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError("");
    try {
      const [creditsResponse, emailJobsResponse] = await Promise.all([
        listCredits(CREDIT_FETCH_PARAMS, { signal: options.signal }),
        listEmailJobs(EMAIL_JOB_FETCH_PARAMS, { signal: options.signal }),
      ]);
      if (requestId === latestRequestId.current) {
        setCredits(creditsResponse.items ?? []);
        setEmailJobs(emailJobsResponse.items ?? []);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (requestId === latestRequestId.current) {
        setCredits([]);
        setEmailJobs([]);
        setError(err.message || "No se pudieron cargar las estadísticas.");
      }
    } finally {
      if (!options.signal?.aborted && requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard({ signal: controller.signal });
    return () => controller.abort();
  }, [loadDashboard]);

  const creditsBySalesperson = useMemo(() => aggregateCreditsBySalesperson(credits), [credits]);
  const emailJobsByStatus = useMemo(() => aggregateEmailJobsByStatus(emailJobs), [emailJobs]);

  const totalRequestedAmount = useMemo(
    () => credits.reduce((sum, credit) => sum + Number(credit.amount ?? 0), 0),
    [credits],
  );
  const totalEstimatedProfit = useMemo(
    () => credits.reduce(
      (sum, credit) => sum + (Number(credit.estimatedTotalToPay ?? 0) - Number(credit.amount ?? 0)),
      0,
    ),
    [credits],
  );

  const chartHeight = Math.max(220, creditsBySalesperson.length * 48);

  return (
    <Stack spacing={3} className="credits-page">
      <Box className="page-title">
        <Typography variant="overline" className="section-badge">Panel</Typography>
        <Typography variant="h4">Dashboard de <span className="text-accent">créditos</span></Typography>
        <Typography variant="body2" className="muted">
          Estadísticas agregadas de créditos activos y estado de envío de correos.
        </Typography>
      </Box>

      <Collapse in={Boolean(error)} unmountOnExit>
        <div className="form-error">{error}</div>
      </Collapse>

      {isLoading ? (
        <Card className="admin-card--padded">
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={22} />
            <Typography variant="body2" className="muted">Cargando estadísticas...</Typography>
          </Stack>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="admin-card--padded">
                <Stack spacing={1}>
                  <Typography variant="overline" className="section-badge">Monto total solicitado</Typography>
                  <Typography variant="h4">{formatCurrency(totalRequestedAmount)}</Typography>
                  <Typography variant="body2" className="muted">Suma de `amount` de todos los créditos activos.</Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="admin-card--padded">
                <Stack spacing={1}>
                  <Typography variant="overline" className="section-badge">Ganancia total estimada</Typography>
                  <Typography variant="h4">{formatCurrency(totalEstimatedProfit)}</Typography>
                  <Typography variant="body2" className="muted">
                    Suma de (total estimado a pagar − monto solicitado) por crédito.
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          <Card className="admin-card--padded">
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5">Créditos por comercial</Typography>
                <Typography variant="body2" className="muted">Cantidad de créditos activos registrados por cada comercial.</Typography>
              </Box>
              {creditsBySalesperson.length === 0 ? (
                <Typography variant="body2" className="muted">No hay créditos para mostrar.</Typography>
              ) : (
                <Box sx={{ width: "100%", height: chartHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={creditsBySalesperson} layout="vertical" margin={{ left: 24, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={160} />
                      <Tooltip formatter={(value) => [value, "Créditos"]} />
                      <Bar dataKey="count" name="Créditos" fill="#00d280" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Stack>
          </Card>

          <Card className="admin-card--padded">
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5">Correos por estado</Typography>
                <Typography variant="body2" className="muted">Enviados exitosamente frente al resto de los estados.</Typography>
              </Box>
              {emailJobsByStatus.length === 0 ? (
                <Typography variant="body2" className="muted">No hay correos para mostrar.</Typography>
              ) : (
                <Box sx={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emailJobsByStatus}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {emailJobsByStatus.map((entry) => (
                          <Cell key={entry.status} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, entry) => [value, entry.payload.label]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
