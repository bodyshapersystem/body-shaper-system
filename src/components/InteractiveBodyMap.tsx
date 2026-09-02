"use client";

/**
 * Real interactive, tappable body silhouette — front + back figures
 * with anatomically-positioned zones. Rebuilt against Emmy's actual
 * reference silhouette (a full-resolution crop she pasted into
 * Canva), reviewed directly, after earlier attempts read as
 * crude/childish. Adds hair pulled back into a bun (a detail visible
 * in the reference that earlier versions missed) and continuous,
 * flowing treatment-zone shapes (a wide waist band, rounded glutes)
 * instead of isolated small circles, matching how the reference
 * actually shades areas. Verified visually via multiple
 * headless-browser render iterations, comparing against the
 * reference each time, before shipping.
 *
 * Zone names match session-objectives.ts's real area presets exactly,
 * so this plugs directly into the existing objective-generation and
 * Blueprint Alignment logic with no translation layer.
 */

const STROKE = "#B9A38F";
const FILL_SELECTED = "rgba(199,158,147,0.8)";

type Zone = { name: string; path: string; optional?: boolean };

const FRONT_ZONES: Zone[] = [
  { name: "Abdomen", path: "M50,148 C60,140 100,140 110,148 C113,158 111,170 104,178 C88,170 72,170 56,178 C49,170 47,158 50,148 Z" },
  { name: "Lower Abdomen", path: "M56,178 C72,170 88,170 104,178 C102,188 96,197 80,199 C64,197 58,188 56,178 Z" },
  { name: "Left Flank / Lateral", path: "M50,148 C46,155 46,164 50,172 L56,178 C52,170 51,159 54,150 Z" },
  { name: "Right Flank / Lateral", path: "M110,148 C114,155 114,164 110,172 L104,178 C108,170 109,159 106,150 Z" },
  { name: "Left Front Thigh", path: "M64,222 C70,218 76,220 78,225 L76,270 Q71,274 66,270 Z" },
  { name: "Right Front Thigh", path: "M82,225 C84,220 90,218 96,222 L94,270 Q89,274 84,270 Z" },
  { name: "Inner Thighs", path: "M76,225 L84,225 L83,268 L77,268 Z" },
  { name: "Knees", path: "M67,280 Q73,277 79,280 L78,296 Q73,299 68,296 Z M81,280 Q87,277 93,280 L92,296 Q87,299 82,296 Z" },
];

const BACK_ZONES: Zone[] = [
  { name: "Lower Back", path: "M52,152 C64,144 96,144 108,152 C111,161 109,170 103,177 C88,170 72,170 57,177 C51,170 49,161 52,152 Z" },
  { name: "Waistline / Back", path: "M57,177 C72,170 88,170 103,177 C100,187 92,193 80,194 C68,193 60,187 57,177 Z" },
  { name: "Posterior Left Arm", path: "M46,92 C43,102 42,115 43,127 L50,126 C49,114 50,102 53,92 Z", optional: true },
  { name: "Posterior Right Arm", path: "M114,92 C117,102 118,115 117,127 L110,126 C111,114 110,102 107,92 Z", optional: true },
  { name: "Left Glute", path: "M58,182 C65,178 78,177 80,182 L79,205 C70,208 62,204 58,196 Z" },
  { name: "Right Glute", path: "M102,182 C95,178 82,177 80,182 L81,205 C90,208 98,204 102,196 Z" },
  { name: "Left Posterior Thigh", path: "M64,222 C70,218 76,220 78,225 L76,270 Q71,274 66,270 Z" },
  { name: "Right Posterior Thigh", path: "M82,225 C84,220 90,218 96,222 L94,270 Q89,274 84,270 Z" },
  { name: "Outer Thighs", path: "M58,225 L64,225 L62,268 L56,268 Z M96,225 L102,225 L104,268 L98,268 Z" },
  { name: "Calves", path: "M67,300 Q73,297 79,300 L77,340 Q73,343 69,340 Z M81,300 Q87,297 93,300 L91,340 Q87,343 83,340 Z" },
];

const BODY_PATH =
  "M 68,50 C 60,52 54,56 52,64 C 48,74 46,87 47,102 C 48,117 50,130 54,142 " +
  "C 51,152 49,164 50,177 C 48,192 47,207 49,222 L 52,342 C 52,357 53,370 55,380 " +
  "L 62,380 C 61,367 60,354 60,342 L 62,227 C 65,217 68,207 71,200 " +
  "C 73,203 76,205 80,205 C 84,205 87,203 89,200 C 92,207 95,217 98,227 " +
  "L 100,342 C 100,354 99,367 98,380 L 105,380 C 107,370 108,357 108,342 " +
  "L 111,222 C 113,207 112,192 110,177 C 111,164 109,152 106,142 " +
  "C 110,130 112,117 113,102 C 114,87 112,74 108,64 C 106,56 100,52 92,50 " +
  "C 90,56 86,59 80,59 C 74,59 70,56 68,50 Z";
const LEFT_ARM_PATH = "M52,64 C48,74 45,87 44,102 C43,117 44,130 46,140 L51,139 C49,129 48,117 49,103 C50,89 52,77 56,67 Z";
const RIGHT_ARM_PATH = "M108,64 C112,74 115,87 116,102 C117,117 116,130 114,140 L109,139 C111,129 112,117 111,103 C110,89 108,77 104,67 Z";

function FigureOutline() {
  return (
    <>
      <ellipse cx="80" cy="8" rx="6" ry="5" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <ellipse cx="80" cy="26" rx="12" ry="15" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M69,17 C61,24 58,38 61,52" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M91,17 C99,24 102,38 99,52" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M74,39 L74,48 M86,39 L86,48" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d={BODY_PATH} fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d={LEFT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={RIGHT_ARM_PATH} fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M50,380 Q52,386 60,386 L62,380 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
      <path d="M110,380 Q108,386 100,386 L98,380 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
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
    <svg viewBox="0 0 160 390" width="100%" style={{ maxWidth: 150 }}>
      <FigureOutline />
      {zones.map((z) => {
        const isSelected = selected.has(z.name);
        return (
          <path
            key={z.name}
            d={z.path}
            fill={isSelected ? FILL_SELECTED : "rgba(0,0,0,0.001)"}
            stroke={isSelected ? "none" : "rgba(185,163,143,0.45)"}
            strokeWidth="1"
            strokeDasharray={isSelected ? undefined : "2,2"}
            style={{ cursor: "pointer", touchAction: "manipulation" }}
            onClick={() => onToggle(z.name)}
          >
            <title>{z.name}</title>
          </path>
        );
      })}
      <text x="80" y="384" textAnchor="middle" fontSize="9" fill="#9C8A76" fontFamily="var(--sans)" letterSpacing="1">
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
