import { illustrationPalette as P } from "./palette.js";

function Tile({ children, size = 160, label }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="160" height="160" rx="20" fill={P.sage} />
      {children}
    </svg>
  );
}

function Eyes({ cx = 80, cy = 78, gap = 18 }) {
  return (
    <>
      <circle cx={cx - gap / 2} cy={cy} r="3.2" fill={P.ink} />
      <circle cx={cx + gap / 2} cy={cy} r="3.2" fill={P.ink} />
    </>
  );
}

function Mouth({ cx = 80, cy = 90 }) {
  return <path d={`M${cx - 6} ${cy} Q${cx} ${cy + 6} ${cx + 6} ${cy}`} fill="none" stroke={P.ink} strokeWidth="2" strokeLinecap="round" />;
}

export function PortraitLogin({ size = 280 }) {
  return (
    <Tile size={size} label="Retrato de una persona con hiyab">
      <ellipse cx="80" cy="148" rx="48" ry="22" fill={P.ink} />
      <path d="M28 150 C28 88 48 42 80 42 C112 42 132 88 132 150 Z" fill={P.ink} />
      <ellipse cx="80" cy="86" rx="28" ry="32" fill={P.paper} />
      <path d="M48 70 C52 48 68 38 80 38 C92 38 108 48 112 70 C104 58 90 54 80 54 C70 54 56 58 48 70 Z" fill={P.ink} />
      <Eyes cy={80} />
      <Mouth cy={94} />
    </Tile>
  );
}

export function PortraitCopilot({ size = 48 }) {
  return (
    <Tile size={size} label="Retrato del copiloto">
      <ellipse cx="80" cy="150" rx="44" ry="20" fill={P.ink} />
      <rect x="44" y="118" width="72" height="28" rx="10" fill={P.ink} />
      <circle cx="80" cy="78" r="30" fill={P.paper} />
      <path d="M50 78 C50 50 62 44 80 44 C98 44 110 50 110 78 L110 70 C110 48 98 40 80 40 C62 40 50 48 50 70 Z" fill={P.ink} />
      <circle cx="71" cy="78" r="9" fill="none" stroke={P.ink} strokeWidth="2.4" />
      <circle cx="89" cy="78" r="9" fill="none" stroke={P.ink} strokeWidth="2.4" />
      <path d="M80 78 H80.01" stroke={P.ink} strokeWidth="2.4" />
      <circle cx="71" cy="78" r="2.6" fill={P.ink} />
      <circle cx="89" cy="78" r="2.6" fill={P.ink} />
      <Mouth cy={94} />
      <circle cx="112" cy="88" r="3.4" fill="none" stroke={P.ink} strokeWidth="2" />
    </Tile>
  );
}

export function PortraitEmptyCredits({ size = 120 }) {
  return (
    <Tile size={size} label="Retrato de una persona con afro">
      <circle cx="80" cy="70" r="40" fill={P.ink} />
      <ellipse cx="80" cy="148" rx="42" ry="18" fill={P.ink} />
      <path d="M52 118 H108 L116 156 H44 Z" fill={P.ink} />
      <circle cx="80" cy="82" r="26" fill={P.paper} />
      <Eyes cy={80} gap={16} />
      <Mouth cy={94} />
    </Tile>
  );
}

export function PortraitEmptySearch({ size = 120 }) {
  return (
    <Tile size={size} label="Retrato de una persona con capucha">
      <ellipse cx="80" cy="150" rx="46" ry="18" fill={P.ink} />
      <path d="M36 150 C36 78 52 40 80 40 C108 40 124 78 124 150 Z" fill={P.ink} />
      <ellipse cx="80" cy="86" rx="24" ry="28" fill={P.paper} />
      <path d="M56 72 C60 54 70 48 80 48 C90 48 100 54 104 72" fill="none" stroke={P.ink} strokeWidth="4" />
      <Eyes cy={84} gap={16} />
      <Mouth cy={98} />
    </Tile>
  );
}

export function PortraitEmptyClients({ size = 120 }) {
  return (
    <Tile size={size} label="Retrato de una persona con gorro y lentes">
      <ellipse cx="80" cy="150" rx="44" ry="18" fill={P.ink} />
      <path d="M48 120 H112 L118 156 H42 Z" fill={P.ink} />
      <circle cx="80" cy="84" r="28" fill={P.paper} />
      <path d="M48 78 C48 52 60 44 80 44 C100 44 112 52 112 78 L112 70 C108 48 96 40 80 40 C64 40 52 48 48 70 Z" fill={P.ink} />
      <rect x="50" y="46" width="60" height="16" rx="8" fill={P.ink} />
      <circle cx="70" cy="84" r="8" fill="none" stroke={P.ink} strokeWidth="2.4" />
      <circle cx="90" cy="84" r="8" fill="none" stroke={P.ink} strokeWidth="2.4" />
      <path d="M78 84 H82" stroke={P.ink} strokeWidth="2.4" />
      <circle cx="70" cy="84" r="2.4" fill={P.ink} />
      <circle cx="90" cy="84" r="2.4" fill={P.ink} />
      <Mouth cy={100} />
    </Tile>
  );
}

export function PortraitEmptyMail({ size = 120 }) {
  return (
    <Tile size={size} label="Retrato de una persona con auriculares">
      <ellipse cx="80" cy="150" rx="44" ry="18" fill={P.ink} />
      <path d="M50 118 H110 L116 156 H44 Z" fill={P.ink} />
      <circle cx="80" cy="80" r="28" fill={P.paper} />
      <path d="M56 78 C56 54 66 48 80 48 C94 48 104 54 104 78" fill="none" stroke={P.ink} strokeWidth="6" strokeLinecap="round" />
      <rect x="46" y="74" width="12" height="22" rx="6" fill={P.ink} />
      <rect x="102" y="74" width="12" height="22" rx="6" fill={P.ink} />
      <Eyes cy={80} gap={16} />
      <Mouth cy={94} />
      <path d="M54 118 C54 128 70 134 80 134 C90 134 106 128 106 118" fill="none" stroke={P.paper} strokeWidth="3" opacity="0.7" />
    </Tile>
  );
}
