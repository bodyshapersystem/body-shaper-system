function base() {
  return { viewBox: "0 0 24 24", fill: "none" as const, width: 16, height: 16 };
}

export function RulerIcon() {
  return (
    <svg {...base()}>
      <rect x="3" y="8" width="18" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <line x1="7" y1="8" x2="7" y2="11" stroke="currentColor" strokeWidth="1.1" />
      <line x1="11" y1="8" x2="11" y2="11" stroke="currentColor" strokeWidth="1.1" />
      <line x1="15" y1="8" x2="15" y2="11" stroke="currentColor" strokeWidth="1.1" />
      <line x1="19" y1="8" x2="19" y2="11" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function ScaleIcon() {
  return (
    <svg {...base()}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 8v4l2.5 2.2" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg {...base()}>
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function NoteIcon() {
  return (
    <svg {...base()}>
      <path d="M6 3.5h9l3 3V20.5H6z" stroke="currentColor" strokeWidth="1.1" />
      <line x1="9" y1="9.5" x2="16" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="9" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function StrategyIcon() {
  return (
    <svg {...base()}>
      <path d="M7 3.5c0 5 10 5 10 10s-10 5-10 10" stroke="currentColor" strokeWidth="1.1" />
      <path d="M17 3.5c0 5-10 5-10 10s10 5 10 10" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/** The recurring BSS crosshair/target mark used across editorial Blueprint layouts. */
export function TargetMarkIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <circle cx="22" cy="22" r="8" stroke="currentColor" strokeWidth="0.75" opacity="0.8" />
      <circle cx="22" cy="22" r="2" fill="currentColor" />
      <line x1="0" y1="22" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <line x1="32" y1="22" x2="44" y2="22" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <line x1="22" y1="0" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <line x1="22" y1="32" x2="22" y2="44" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
    </svg>
  );
}
