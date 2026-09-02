"use client";

/**
 * Real interactive, tappable body silhouette — front + back figures
 * with anatomically-positioned zones (not generic circles/rectangles).
 * Tapping toggles selection; selected zones render as dusty-rose
 * fills over a thin taupe line-art contour, per the approved visual
 * spec. Zone names match session-objectives.ts's real area presets
 * exactly, so this plugs directly into the existing objective-
 * generation and Blueprint Alignment logic with no translation layer.
 *
 * The figure itself (an elegant standing croquis-style silhouette —
 * oval head, simple bun, shoulders, arms hanging separately at the
 * sides, torso tapering to waist/hip, two legs) was verified visually
 * via a headless-browser render before shipping, after an earlier
 * version read as a crude stick figure rather than an editorial
 * silhouette.
 */

const STROKE = "#B9A38F";
const FILL_SELECTED = "rgba(210,161,153,0.55)";

type Zone = { name: string; path: string };

const FRONT_ZONES: Zone[] = [
  { name: "Abdomen", path: "M83,148 Q100,143 117,148 L116,168 Q100,174 84,168 Z" },
  { name: "Lower Abdomen", path: "M84,168 Q100,174 116,168 L114,186 Q100,192 86,186 Z" },
  { name: "Left Flank / Lateral", path: "M66,150 Q73,152 78,158 L75,182 Q68,178 63,168 Z" },
  { name: "Right Flank / Lateral", path: "M134,150 Q127,152 122,158 L125,182 Q132,178 137,168 Z" },
  { name: "Left Front Thigh", path: "M78,225 Q88,220 95,225 L92,270 Q84,274 76,270 Z" },
  { name: "Right Front Thigh", path: "M105,225 Q112,220 122,225 L124,270 Q116,274 108,270 Z" },
  { name: "Inner Thighs", path: "M92,228 L108,228 L107,270 L93,270 Z" },
  { name: "Knees", path: "M78,278 Q84,275 90,278 L88,298 Q84,301 80,298 Z M110,278 Q116,275 122,278 L120,298 Q116,301 112,298 Z" },
];

const BACK_ZONES: Zone[] = [
  { name: "Lower Back", path: "M78,150 Q100,146 122,150 L120,182 Q100,188 80,182 Z" },
  { name: "Waistline / Back", path: "M80,182 Q100,188 120,182 L118,198 Q100,204 82,198 Z" },
  { name: "Posterior Left Arm", path: "M65,155 Q73,158 77,168 L72,180 Q65,175 62,166 Z" },
  { name: "Posterior Right Arm", path: "M135,155 Q127,158 123,168 L128,180 Q135,175 138,166 Z" },
  { name: "Left Glute", path: "M78,206 Q88,202 96,206 L94,225 Q84,228 76,225 Z" },
  { name: "Right Glute", path: "M104,206 Q112,202 122,206 L124,225 Q116,228 106,225 Z" },
  { name: "Left Posterior Thigh", path: "M78,228 Q88,224 95,228 L92,272 Q84,275 77,272 Z" },
  { name: "Right Posterior Thigh", path: "M105,228 Q112,224 122,228 L123,272 Q116,275 108,272 Z" },
  { name: "Outer Thighs", path: "M74,230 L80,230 L78,270 L72,270 Z M120,230 L126,230 L128,270 L122,270 Z" },
  { name: "Calves", path: "M78,300 Q84,297 90,300 L88,340 Q84,343 80,340 Z M110,300 Q116,297 122,300 L120,340 Q116,343 112,340 Z" },
];

const BODY_PATH =
  "M 88,53 C 82,58 78,63 76,70 C 68,76 62,88 60,105 C 58,122 60,138 66,150 " +
  "C 62,160 60,170 62,180 C 58,192 56,205 58,218 L 62,340 " +
  "C 63,355 65,368 68,382 L 78,382 C 76,368 75,355 75,342 L 78,225 " +
  "C 82,212 86,200 90,190 C 94,196 98,199 100,199 C 102,199 106,196 110,190 " +
  "C 114,200 118,212 122,225 L 125,342 C 125,355 124,368 122,382 L 132,382 " +
  "C 135,368 137,355 138,340 L 142,218 C 144,205 142,192 138,180 " +
  "C 140,170 138,160 134,150 C 140,138 142,122 140,105 C 138,88 132,76 124,70 " +
  "C 122,63 118,58 112,53 C 108,58 104,60 100,60 C 96,60 92,58 88,53 Z";

const LEFT_ARM_PATH = "M76,70 C68,80 63,95 60,115 C58,135 58,155 60,172 L68,172 C67,155 68,135 70,116 C72,98 76,85 82,74 Z";
const RIGHT_ARM_PATH = "M124,70 C132,80 137,95 140,115 C142,135 142,155 140,172 L132,172 C133,155 132,135 130,116 C128,98 124,85 118,74 Z";

function FigureOutline() {
  return (
    <>
      <ellipse cx="100" cy="34" rx="15" ry="19" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d="M88,18 Q100,8 112,18" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d={BODY_PATH} fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={LEFT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={RIGHT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
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
    <svg viewBox="0 0 200 420" width="100%" style={{ maxWidth: 170 }}>
      <FigureOutline />
      {zones.map((z) => (
        <path
          key={z.name}
          d={z.path}
          fill={selected.has(z.name) ? FILL_SELECTED : "none"}
          stroke={selected.has(z.name) ? "#C79E93" : "rgba(185,163,143,0.4)"}
          strokeWidth="1"
          style={{ cursor: "pointer" }}
          onClick={() => onToggle(z.name)}
        >
          <title>{z.name}</title>
        </path>
      ))}
      <text x="100" y="410" textAnchor="middle" fontSize="10" fill="#9C8A76" fontFamily="var(--sans)" letterSpacing="1">
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
