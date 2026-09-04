"use client";

/**
 * Real interactive, tappable "Session Area Map" body silhouette —
 * front + back, full body, with connected (not isolated-circle)
 * treatment zones, matching Emmy's approved reference exactly
 * (reviewed directly via Canva: elegant croquis figure with hair
 * pulled into a bun, merged abdomen/back regions, area names
 * matching the reference's own chip labels). Rebuilt after several
 * earlier attempts read as crude — this version reuses the proven
 * simple-line construction (straight polylines + gentle single-arc
 * joints, no compound bezier curves) that finally read as a clean,
 * normal human silhouette, verified visually multiple times before
 * shipping.
 *
 * Zone names match session-objectives.ts's real area presets, so
 * this plugs directly into the existing objective-generation and
 * Blueprint Alignment logic with no translation layer.
 */

const STROKE = "#B9A38F";
const FILL_SELECTED = "rgba(199,158,147,0.8)";

type Zone = { name: string; path: string };

const FRONT_ZONES: Zone[] = [
  { name: "Upper Abdomen", path: "M62,148 Q80,140 98,148 Q100,160 92,172 Q80,178 68,172 Q60,160 62,148 Z" },
  { name: "Lower Abdomen", path: "M68,172 Q80,178 92,172 Q90,186 80,190 Q70,186 68,172 Z" },
  { name: "Laterals", path: "M62,148 Q58,158 62,168 L68,172 Q64,162 65,150 Z M98,148 Q102,158 98,168 L92,172 Q96,162 95,150 Z" },
  { name: "Left Front Thigh", path: "M63,222 Q69,219 74,223 L73,270 Q68,273 64,270 Z" },
  { name: "Right Front Thigh", path: "M86,223 Q91,219 97,222 L96,270 Q92,273 87,270 Z" },
  { name: "Inner Thighs", path: "M74,224 L86,224 L85,269 L75,269 Z" },
  { name: "Knees", path: "M64,278 Q69,275 74,278 L73,294 Q69,297 65,294 Z M86,278 Q91,275 96,278 L95,294 Q91,297 87,294 Z" },
];

const BACK_ZONES: Zone[] = [
  { name: "Upper Back", path: "M64,150 Q80,142 96,150 Q97,158 94,164 Q80,158 66,164 Q63,158 64,150 Z" },
  { name: "Lower Back", path: "M66,164 Q80,158 94,164 Q96,172 92,178 Q80,183 68,178 Q64,172 66,164 Z" },
  { name: "Back Arms", path: "M46,92 C43,102 42,115 43,127 L50,126 C49,114 50,102 53,92 Z M114,92 C117,102 118,115 117,127 L110,126 C111,114 110,102 107,92 Z" },
  { name: "Left Glute", path: "M64,200 Q72,196 80,200 L79,220 Q70,223 63,215 Z" },
  { name: "Right Glute", path: "M96,200 Q88,196 80,200 L81,220 Q90,223 97,215 Z" },
  { name: "Left Posterior Thigh", path: "M63,222 Q69,219 74,223 L73,270 Q68,273 64,270 Z" },
  { name: "Right Posterior Thigh", path: "M86,223 Q91,219 97,222 L96,270 Q92,273 87,270 Z" },
  { name: "Outer Thighs", path: "M58,224 L64,224 L62,268 L56,268 Z M96,224 L102,224 L104,268 L98,268 Z" },
  { name: "Calves", path: "M64,300 Q69,297 74,300 L72,340 Q68,343 65,340 Z M86,300 Q91,297 96,300 L94,340 Q90,343 88,340 Z" },
];

function FigureOutline() {
  return (
    <>
      <circle cx="80" cy="9" r="5" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <circle cx="80" cy="27" r="13" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d="M69,18 Q62,20 62,30" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <path d="M91,18 Q98,20 98,30" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <line x1="75" y1="40" x2="75" y2="50" stroke={STROKE} strokeWidth="1.3" />
      <line x1="85" y1="40" x2="85" y2="50" stroke={STROKE} strokeWidth="1.3" />
      <polyline points="75,50 58,58 62,90 66,130 63,150 66,170" fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <polyline points="85,50 102,58 98,90 94,130 97,150 94,170" fill="none" stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M66,170 Q80,178 94,170" fill="none" stroke={STROKE} strokeWidth="1.3" />
      <polyline points="58,58 50,90 47,125 49,155" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="102,58 110,90 113,125 111,155" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="66,172 63,220 62,280 60,340 60,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="74,172 74,220 73,280 72,340 71,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="86,172 86,220 87,280 88,340 89,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <polyline points="94,172 97,220 98,280 100,340 100,380" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M60,380 L71,380 L71,386 L64,386 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
      <path d="M100,380 L89,380 L89,386 L96,386 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />
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
    <div style={{ textAlign: "center" }}>
      <p className="sbm-fig-label">{side === "front" ? "front" : "back"}</p>
      <svg viewBox="0 0 160 400" width="100%" style={{ maxWidth: 150 }}>
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
      </svg>
    </div>
  );
}

export default function SessionBodyMap({
  selectedAreas,
  onToggleArea,
}: {
  selectedAreas: Set<string>;
  onToggleArea: (area: string) => void;
}) {
  return (
    <div className="sbm-figs-row">
      <BodyFigure side="front" zones={FRONT_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
      <BodyFigure side="back" zones={BACK_ZONES} selected={selectedAreas} onToggle={onToggleArea} />
    </div>
  );
}
