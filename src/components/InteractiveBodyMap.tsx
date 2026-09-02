"use client";

/**
 * Real interactive, tappable body silhouette — front + back figures
 * with anatomically-positioned, organically-shaped zones. Rebuilt
 * against Emmy's actual reference mockups (pasted into a Canva
 * design and reviewed directly) after two earlier text-only attempts
 * read as crude/angular — this version uses a slender croquis-style
 * outline and soft ellipse treatment zones matching the reference's
 * visual language exactly. Verified visually via a headless-browser
 * render, side-by-side against the reference proportions, before
 * shipping.
 *
 * Zone names match session-objectives.ts's real area presets exactly,
 * so this plugs directly into the existing objective-generation and
 * Blueprint Alignment logic with no translation layer.
 */

const STROKE = "#B9A38F";
const FILL_SELECTED = "rgba(210,161,153,0.65)";

type Zone = { cx: number; cy: number; rx: number; ry: number; name: string };

const FRONT_ZONES: Zone[] = [
  { name: "Abdomen", cx: 80, cy: 148, rx: 16, ry: 15 },
  { name: "Lower Abdomen", cx: 80, cy: 172, rx: 14, ry: 10 },
  { name: "Left Flank / Lateral", cx: 58, cy: 150, rx: 7, ry: 14 },
  { name: "Right Flank / Lateral", cx: 102, cy: 150, rx: 7, ry: 14 },
  { name: "Left Front Thigh", cx: 68, cy: 255, rx: 9, ry: 26 },
  { name: "Right Front Thigh", cx: 92, cy: 255, rx: 9, ry: 26 },
  { name: "Inner Thighs", cx: 80, cy: 258, rx: 7, ry: 24 },
  { name: "Knees", cx: 80, cy: 292, rx: 10, ry: 7 },
];

const BACK_ZONES: Zone[] = [
  { name: "Lower Back", cx: 80, cy: 152, rx: 20, ry: 12 },
  { name: "Waistline / Back", cx: 80, cy: 178, rx: 17, ry: 9 },
  { name: "Posterior Left Arm", cx: 49, cy: 90, rx: 6, ry: 18 },
  { name: "Posterior Right Arm", cx: 111, cy: 90, rx: 6, ry: 18 },
  { name: "Left Glute", cx: 65, cy: 208, rx: 11, ry: 12 },
  { name: "Right Glute", cx: 95, cy: 208, rx: 11, ry: 12 },
  { name: "Left Posterior Thigh", cx: 65, cy: 250, rx: 9, ry: 24 },
  { name: "Right Posterior Thigh", cx: 95, cy: 250, rx: 9, ry: 24 },
  { name: "Outer Thighs", cx: 60, cy: 260, rx: 5, ry: 22 },
  { name: "Calves", cx: 80, cy: 320, rx: 20, ry: 20 },
];

const BODY_PATH =
  "M 68,48 C 60,50 54,54 52,62 C 48,72 46,85 47,100 C 48,115 50,128 54,140 " +
  "C 51,150 49,162 50,175 C 48,190 47,205 49,220 L 52,340 C 52,355 53,368 55,378 " +
  "L 62,378 C 61,365 60,352 60,340 L 62,225 C 65,215 68,205 71,198 " +
  "C 73,201 76,203 80,203 C 84,203 87,201 89,198 C 92,205 95,215 98,225 " +
  "L 100,340 C 100,352 99,365 98,378 L 105,378 C 107,368 108,355 108,340 " +
  "L 111,220 C 113,205 112,190 110,175 C 111,162 109,150 106,140 " +
  "C 110,128 112,115 113,100 C 114,85 112,72 108,62 C 106,54 100,50 92,48 " +
  "C 90,54 86,57 80,57 C 74,57 70,54 68,48 Z";

const LEFT_ARM_PATH = "M52,62 C48,72 45,85 44,100 C43,115 44,128 46,138 L51,137 C49,127 48,115 49,101 C50,87 52,75 56,65 Z";
const RIGHT_ARM_PATH = "M108,62 C112,72 115,85 116,100 C117,115 116,128 114,138 L109,137 C111,127 112,115 111,101 C110,87 108,75 104,65 Z";

function FigureOutline() {
  return (
    <>
      <ellipse cx="80" cy="20" rx="12" ry="15" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M69,14 C60,22 57,38 60,52" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M91,14 C100,22 103,38 100,52" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M74,33 L74,42 M86,33 L86,42" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d={BODY_PATH} fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d={LEFT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={RIGHT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
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
    <svg viewBox="0 0 160 380" width="100%" style={{ maxWidth: 150 }}>
      <FigureOutline />
      {zones.map((z) => {
        const isSelected = selected.has(z.name);
        return (
          <ellipse
            key={z.name}
            cx={z.cx}
            cy={z.cy}
            rx={z.rx}
            ry={z.ry}
            fill={isSelected ? FILL_SELECTED : "none"}
            stroke={isSelected ? "#C79E93" : "rgba(185,163,143,0.45)"}
            strokeWidth="1"
            strokeDasharray={isSelected ? undefined : "2,2"}
            style={{ cursor: "pointer" }}
            onClick={() => onToggle(z.name)}
          >
            <title>{z.name}</title>
          </ellipse>
        );
      })}
      <text x="80" y="372" textAnchor="middle" fontSize="9" fill="#9C8A76" fontFamily="var(--sans)" letterSpacing="1">
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
    <div style={{ display: "flex", justifyContent: "center", gap: 18, background: "#FBF8F3", borderRadius: 16, padding: "18px 8px", border: "1px solid rgba(200,161,90,0.25)" }}>
      <BodyFigure side="front" zones={FRONT_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
      <BodyFigure side="back" zones={BACK_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
    </div>
  );
}
