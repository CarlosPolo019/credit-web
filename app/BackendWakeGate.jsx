import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const HEALTH_CHECK_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 5 * 60 * 1000;
const MESSAGE_ROTATION_MS = 4000;

// Buckets by elapsed time (ms), each with a few messages that rotate in
// order so the wait — up to 5 minutes on a very slow cold start — reads as
// a story with beats instead of one static line staring back at you.
const MESSAGE_BUCKETS = [
  { until: 8000, messages: ["Conectando con el servidor...", "Verificando la conexión..."] },
  {
    until: 25000,
    messages: [
      "El servidor estaba dormido, dándole un empujoncito...",
      "Encendiendo motores...",
      "Ya se despertó, dale un momento para estar listo...",
    ],
  },
  {
    until: 70000,
    messages: [
      "Vamos por buen camino...",
      "Cada segundo que pasa estamos más cerca...",
      "El servidor se está desperezando...",
      "Un poquito más de paciencia...",
    ],
  },
  {
    until: 150000,
    messages: [
      "Gracias por esperar, ya casi...",
      "Esto no es lo normal, pero ya falta poco...",
      "Seguimos aquí, no te vayas...",
      "Los últimos ajustes están en camino...",
    ],
  },
  {
    until: Infinity,
    messages: [
      "Sabemos que es más de lo normal, gracias por tu paciencia...",
      "Ya casi, de verdad...",
      "Esto está por terminar...",
      "Un último esfuerzo y estamos listos...",
    ],
  },
];

function messageForElapsed(elapsedMs, rotationIndex) {
  const bucket = MESSAGE_BUCKETS.find((candidate) => elapsedMs < candidate.until) ?? MESSAGE_BUCKETS[MESSAGE_BUCKETS.length - 1];
  return bucket.messages[rotationIndex % bucket.messages.length];
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
  const [rotationIndex, setRotationIndex] = useState(0);

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
    const rotationTimer = setInterval(() => {
      if (!cancelled) setRotationIndex((index) => index + 1);
    }, MESSAGE_ROTATION_MS);

    return () => {
      cancelled = true;
      clearInterval(tickTimer);
      clearInterval(rotationTimer);
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
        {messageForElapsed(elapsedMs, rotationIndex)}
      </Typography>
      <Box className="backend-wake__bar">
        <Box className="backend-wake__bar-fill" />
      </Box>
    </Box>
  );
}
