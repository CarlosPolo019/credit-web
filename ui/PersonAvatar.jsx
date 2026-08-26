import MuiAvatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const PALETTE = [
  { bg: "#00d280", color: "#052224" },
  { bg: "#052224", color: "#ffffff" },
  { bg: "#0d9488", color: "#ffffff" },
  { bg: "#047857", color: "#ffffff" },
];

const PERSON_IMAGES = {
  "adriana castellano": "/people/adriana-castellano.jpg",
  "carlos escorcia": "/people/carlos-escorcia.jpg",
  "jennifer navarro": "/people/jennifer-navarro.jpg",
};

function normalizeName(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function swatchFor(name) {
  const key = String(name ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

function imageFor(name) {
  return PERSON_IMAGES[normalizeName(name)];
}

export function PersonAvatar({ name, size = 32 }) {
  const swatch = swatchFor(name);
  const imageSrc = imageFor(name);
  return (
    <MuiAvatar
      alt={name || "Persona"}
      src={imageSrc}
      sx={{ width: size, height: size, bgcolor: swatch.bg, color: swatch.color, fontSize: size * 0.4, fontWeight: 700 }}
    >
      {initials(name)}
    </MuiAvatar>
  );
}

export function PersonChip({ name, size = 32, secondaryText }) {
  if (!name) return "-";
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <PersonAvatar name={name} size={size} />
      <Stack spacing={0}>
        <Typography variant="body2" fontWeight={600}>{name}</Typography>
        {secondaryText ? (
          <Typography variant="caption" className="muted">{secondaryText}</Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
