import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const HEALTH_CHECK_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 75000;

function messageForElapsed(elapsedMs) {
  if (elapsedMs < 5000) return "Conectando con el servidor...";
  if (elapsedMs < 20000) return "El servidor estaba dormido, dándole un momento para despertar...";
  if (elapsedMs < 45000) return "Ya casi...";
  return "Un poco más de paciencia, esto puede tardar hasta un minuto la primera vez.";
}

/**
 * Render-blocking gate: the free Render tier can take 50s+ to cold-start
 * after being idle. Instead of letting every screen hit its own confusing
 * connection error, poll /actuator/health once up front and hold the app
 * behind a "waking up" message until it responds (or MAX_WAIT_MS passes,
 * so a genuinely down backend doesn't trap the user here forever — normal
 * error handling in api/client.js takes over from there).
 */
export function BackendWakeGate({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
    const healthUrl = `${baseUrl}/actuator/health`;

    async function checkHealth() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
        const response = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        return false;
      }
    }

    async function poll() {
      if (cancelled) return;
      const ok = await checkHealth();
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      if (ok || elapsed >= MAX_WAIT_MS) {
        setIsReady(true);
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    const tickTimer = setInterval(() => {
      if (!cancelled) setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(tickTimer);
    };
  }, []);

  if (isReady) return children;

  return (
    <Box className="backend-wake">
      <Box className="backend-wake__stage">
        <Box component="span" className="backend-wake__shadow" />
        <Box component="img" src="/fya-mark.png" alt="Fya Social Capital" className="backend-wake__logo" />
      </Box>
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        Despertando el servidor
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", minHeight: 24 }}>
        {messageForElapsed(elapsedMs)}
      </Typography>
      <Box className="backend-wake__bar">
        <Box className="backend-wake__bar-fill" />
      </Box>
    </Box>
  );
}
