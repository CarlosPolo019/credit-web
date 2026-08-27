import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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

// Compact ($99,5 M) for the big headline numbers — the exact value is one
// hover away via the Tooltip wrapper, so nothing is lost, just decluttered.
const compactCurrencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  notation: "compact",
  maximumFractionDigits: 1,
});

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

function StatCard({ icon, iconColor, label, value, tooltip, caption }) {
  return (
    <Card className="admin-card--padded dashboard-stat-card">
      <Stack direction="row" spacing={1.75} alignItems="flex-start">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "12px",
            flexShrink: 0,
            backgroundColor: `${iconColor}1a`,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="overline" className="section-badge">{label}</Typography>
          <Tooltip title={tooltip ?? ""} placement="top" arrow disableHoverListener={!tooltip}>
            <Typography variant="h4" noWrap>{value}</Typography>
          </Tooltip>
          {caption ? <Typography variant="body2" className="muted">{caption}</Typography> : null}
        </Stack>
      </Stack>
    </Card>
  );
}

/**
 * Admin-only aggregate view: per-comercial credit counts, global totals
 * (monto solicitado / ganancia estimada / tasa promedio) and an email-status
 * breakdown. Both source lists (`listCredits`, `listEmailJobs`) already
 * return the full active dataset with no server pagination — same
 * assumption ClientsPage, CreditsPage and EmailJobsPage rely on — so every
 * number here is computed client-side from those two fetches, no new
 * backend endpoint.
 */
export function DashboardPage() {
  // Recharts sizes are pixel props, not CSS — they need a JS breakpoint to
  // actually shrink on narrow screens instead of just clipping/overflowing.
  const isCompact = useMediaQuery("(max-width:600px)");
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
  const totalEmailJobs = useMemo(() => emailJobs.length, [emailJobs]);

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
  const averageInterestRate = useMemo(() => {
    if (credits.length === 0) return 0;
    const sum = credits.reduce((total, credit) => total + Number(credit.interestRate ?? 0), 0);
    return sum / credits.length;
  }, [credits]);

  const topSalesperson = creditsBySalesperson[0] ?? null;
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
          <Box className="dashboard-stats-grid">
            <Box sx={{ minWidth: 0 }}>
              <StatCard
                icon={<ReceiptLongOutlinedIcon fontSize="small" />}
                iconColor="#052224"
                label="Créditos activos"
                value={credits.length.toLocaleString("es-CO")}
                caption="Total de créditos registrados"
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <StatCard
                icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                iconColor="#049a5f"
                label="Monto solicitado"
                value={compactCurrencyFormatter.format(totalRequestedAmount)}
                tooltip={formatCurrency(totalRequestedAmount)}
                caption="Suma de todos los créditos"
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <StatCard
                icon={<TrendingUpOutlinedIcon fontSize="small" />}
                iconColor="#00d280"
                label="Ganancia estimada"
                value={compactCurrencyFormatter.format(totalEstimatedProfit)}
                tooltip={formatCurrency(totalEstimatedProfit)}
                caption="Intereses proyectados"
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <StatCard
                icon={<PercentOutlinedIcon fontSize="small" />}
                iconColor="#f59e0b"
                label="Tasa promedio"
                value={`${averageInterestRate.toLocaleString("es-CO", { maximumFractionDigits: 2 })}%`}
                caption="Mensual, entre todos los créditos"
              />
            </Box>
          </Box>

          <Card className="admin-card--padded">
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} alignItems={{ sm: "center" }}>
                <Box>
                  <Typography variant="h5">Créditos por comercial</Typography>
                  <Typography variant="body2" className="muted">Cantidad de créditos activos registrados por cada comercial.</Typography>
                </Box>
                {topSalesperson ? (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{ backgroundColor: "#fef3c7", borderRadius: "999px", px: 1.5, py: 0.5, alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    <EmojiEventsOutlinedIcon fontSize="small" sx={{ color: "#b45309" }} />
                    <Typography variant="body2" fontWeight={700} sx={{ color: "#92400e" }}>
                      Líder: {topSalesperson.name} ({topSalesperson.count})
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>
              {creditsBySalesperson.length === 0 ? (
                <Typography variant="body2" className="muted">No hay créditos para mostrar.</Typography>
              ) : (
                <Box sx={{ width: "100%", height: chartHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={creditsBySalesperson}
                      layout="vertical"
                      margin={isCompact ? { left: 8, right: 28 } : { left: 24, right: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: isCompact ? 11 : 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={isCompact ? 92 : 160}
                        tick={{ fontSize: isCompact ? 11 : 13 }}
                      />
                      <RechartsTooltip formatter={(value) => [value, "Créditos"]} />
                      <Bar dataKey="count" name="Créditos" radius={[0, 4, 4, 0]}>
                        {creditsBySalesperson.map((entry, index) => (
                          <Cell key={entry.name} fill={index === 0 ? "#049a5f" : "#5ee6ae"} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fontWeight: 700, fill: "#052224" }} />
                      </Bar>
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
                <Box sx={{ width: "100%", height: isCompact ? 280 : 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emailJobsByStatus}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={isCompact ? 55 : 70}
                        outerRadius={isCompact ? 85 : 110}
                        paddingAngle={2}
                      >
                        {emailJobsByStatus.map((entry) => (
                          <Cell key={entry.status} fill={entry.color} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            const { cx, cy } = viewBox;
                            return (
                              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={cx} dy="-0.3em" fontSize={isCompact ? 22 : 28} fontWeight="800" fill="#052224">
                                  {totalEmailJobs}
                                </tspan>
                                <tspan x={cx} dy="1.5em" fontSize="12" fill="#6b7280">
                                  correo{totalEmailJobs === 1 ? "" : "s"}
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <RechartsTooltip formatter={(value, _name, entry) => [value, entry.payload.label]} />
                      <Legend wrapperStyle={{ fontSize: isCompact ? 11 : 12 }} />
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
