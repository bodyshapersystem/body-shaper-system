"use client";

/**
 * Real interactive, tappable body silhouette — front + back figures
 * with anatomically-positioned zones (not generic circles/rectangles).
 * Tapping toggles selection; selected zones render as dusty-rose
 * fills over a thin taupe line-art contour, per the approved visual
 * spec. Zone names match session-objectives.ts's real area presets
 * exactly, so this plugs directly into the existing objective-
 * generation and Blueprint Alignment logic with no translation layer.
 */

const STROKE = "#B9A38F";
const FILL_SELECTED = "rgba(210,161,153,0.55)";
const FILL_OPTIONAL_HINT = "none";

type Zone = { name: string; path: string; dashed?: boolean };

// Front figure zones (viewBox 0 0 200 340)
const FRONT_ZONES: Zone[] = [
  { name: "Abdomen", path: "M82,148 Q100,142 118,148 L119,172 Q100,180 81,172 Z" },
  { name: "Lower Abdomen", path: "M81,172 Q100,180 119,172 L120,195 Q100,206 80,195 Z" },
  { name: "Left Flank / Lateral", path: "M64,148 Q74,150 78,160 L76,195 Q66,192 62,178 Z" },
  { name: "Right Flank / Lateral", path: "M136,148 Q126,150 122,160 L124,195 Q134,192 138,178 Z" },
  { name: "Left Front Thigh", path: "M76,215 Q88,212 96,215 L94,255 Q84,258 74,255 Z" },
  { name: "Right Front Thigh", path: "M104,215 Q112,212 124,215 L126,255 Q116,258 106,255 Z" },
  { name: "Inner Thighs", path: "M92,218 L108,218 L106,258 L94,258 Z" },
  { name: "Outer Thighs", path: "M72,218 L80,218 L78,258 L70,258 Z M120,218 L128,218 L130,258 L122,258 Z" },
  { name: "Knees", path: "M78,262 Q84,260 90,262 L89,275 Q84,278 79,275 Z M110,262 Q116,260 122,262 L121,275 Q116,278 111,275 Z" },
];

// Back figure zones (viewBox 0 0 200 340)
const BACK_ZONES: Zone[] = [
  { name: "Lower Back", path: "M74,148 Q100,158 126,148 L124,182 Q100,192 76,182 Z" },
  { name: "Waistline / Back", path: "M76,182 Q100,192 124,182 L122,200 Q100,208 78,200 Z" },
  { name: "Posterior Left Arm", path: "M50,130 Q58,150 56,175 L46,173 Q44,148 42,128 Z" },
  { name: "Posterior Right Arm", path: "M150,130 Q142,150 144,175 L154,173 Q156,148 158,128 Z" },
  { name: "Left Glute", path: "M74,202 Q88,198 98,202 L96,224 Q84,228 72,222 Z" },
  { name: "Right Glute", path: "M102,202 Q112,198 126,202 L128,222 Q116,228 104,224 Z" },
  { name: "Left Posterior Thigh", path: "M76,228 Q88,225 96,228 L94,258 Q84,262 74,258 Z" },
  { name: "Right Posterior Thigh", path: "M104,228 Q112,225 124,228 L126,258 Q116,262 106,258 Z" },
  { name: "Calves", path: "M78,282 Q84,279 90,282 L88,320 Q84,323 80,320 Z M110,282 Q116,279 122,282 L120,320 Q116,323 112,320 Z" },
];

function FigureOutline() {
  return (
    <>
      <ellipse cx="100" cy="35" rx="18" ry="22" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M88,20 Q100,12 112,20" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path
        d="M100,57 L100,70
           M70,80 Q60,90 55,130 L45,175
           M130,80 Q140,90 145,130 L155,175
           M70,80 Q100,68 130,80
           L138,205 Q135,215 128,222
           L124,272 L128,330
           M62,205 Q65,215 72,222
           L76,272 L72,330"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </>
  );
}

function BodyFigure({
  side,
  zones,
  selected,
  onToggle,
}: {
  side: "front" | "back";
  zones: Zone[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <svg viewBox="0 0 200 340" width="100%" style={{ maxWidth: 170 }}>
      <FigureOutline />
      {zones.map((z) => (
        <path
          key={z.name}
          d={z.path}
          fill={selected.has(z.name) ? FILL_SELECTED : FILL_OPTIONAL_HINT}
          stroke={selected.has(z.name) ? "#C79E93" : "rgba(185,163,143,0.4)"}
          strokeWidth="1"
          strokeDasharray={z.dashed && !selected.has(z.name) ? "3,3" : undefined}
          style={{ cursor: "pointer" }}
          onClick={() => onToggle(z.name)}
        >
          <title>{z.name}</title>
        </path>
      ))}
      <text x="100" y="336" textAnchor="middle" fontSize="9" fill="#9C8A76" fontFamily="var(--sans)" letterSpacing="1">
        {side === "front" ? "FRONT" : "BACK"}
      </text>
    </svg>
  );
}

export default function InteractiveBodyMap({
  selectedAreas,
  onToggleArea,
}: {
  selectedAreas: Set<string>;
  onToggleArea: (area: string) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16, background: "#FBF8F3", borderRadius: 16, padding: "16px 8px", border: "1px solid rgba(200,161,90,0.25)" }}>
      <BodyFigure side="front" zones={FRONT_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
      <BodyFigure side="back" zones={BACK_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
    </div>
  );
}
