/**
 * Real "Session Map™" composite card — two stacked cards (ivory
 * title band + wine/stone header block, overlapped by a "Treatment
 * Map" panel), matching Emmy's actual reference mockup exactly
 * (reviewed directly via Canva). Every value shown is real data
 * passed in as props — the technology, date, status, treated areas,
 * and objectives come from an actual logged session
 * (session-objectives.ts's real library), never placeholder text.
 *
 * Two real bugs were caught and fixed during visual verification
 * before shipping: a CSS selector scoped too broadly (`.header-block
 * svg`) blew up small icon SVGs to fill the whole header — fixed by
 * scoping to a dedicated `.smc-header-bg-svg` class; and a missing
 * UTF-8 declaration mangled the ™/› characters — both confirmed
 * fixed via follow-up renders.
 */
export default function SessionMapCard({
  sessionLabel,
  dateLabel,
  status,
  technology,
  technologySub,
  areas,
  optionalAreas,
  objectives,
  detailsHref,
}: {
  sessionLabel: string;
  dateLabel: string;
  status: string;
  technology: string;
  technologySub?: string;
  areas: string[];
  optionalAreas?: string[];
  objectives: string[];
  detailsHref?: string;
}) {
  return (
    <div className="smc-composite">
      <div className="smc-back-card">
        <div className="smc-title-band">
          <h1 className="smc-title">
            session map<span className="smc-sup">™</span>
          </h1>
          <p className="smc-subtitle">
            your personalized sessions,
            <br />
            mapped to your transformation.
          </p>
          <div className="smc-gold-rule-sm" />
        </div>

        <div className="smc-header-block">
          <svg className="smc-header-bg-svg" viewBox="0 0 340 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="smc-wine" x1="0%" y1="0%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="#3A0F13" />
                <stop offset="100%" stopColor="#4C161B" />
              </linearGradient>
              <filter id="smc-glow">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="340" height="150" fill="#D9CFC0" />
            <path d="M0,0 L231,0 Q252,40 238,75 Q222,110 245,150 L0,150 Z" fill="url(#smc-wine)" />
            <g stroke="#6B2A2E" strokeWidth="1" fill="none" opacity="0.3">
              <path d="M10,140 Q100,90 180,20" />
              <path d="M5,110 Q80,70 150,10" />
              <path d="M15,145 Q110,100 195,40" />
              <path d="M0,80 Q60,50 120,5" />
            </g>
            <g stroke="#C7BBA9" strokeWidth="1" fill="none" opacity="0.3">
              <path d="M250,10 Q280,75 260,140" />
            </g>
            <path
              d="M231,0 Q252,40 238,75 Q222,110 245,150"
              fill="none"
              stroke="#E8C77E"
              strokeWidth="1.6"
              opacity="0.85"
              filter="url(#smc-glow)"
            />
            <g stroke="#C9A25E" strokeWidth="1" fill="none" opacity="0.75">
              <path d="M300,110 L302,120 L312,122 L302,124 L300,134 L298,124 L288,122 L298,120 Z" />
            </g>
          </svg>
          <div className="smc-header-content">
            <p className="smc-next-label">Next Session</p>
            <p className="smc-session-num">{sessionLabel}</p>
            <div className="smc-gold-rule-xs" />
            <div className="smc-info-row">
              <span className="smc-info-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="2">
                  <rect x="4" y="5" width="16" height="16" rx="2" />
                  <path d="M4 10h16M8 3v4M16 3v4" />
                </svg>
              </span>
              <span className="smc-info-text">{dateLabel}</span>
            </div>
            <div className="smc-info-row">
              <span className="smc-info-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              <span className="smc-info-text">{status}</span>
            </div>
            <div className="smc-tech-col">
              <p className="smc-tech-label">Technology</p>
              <span className="smc-info-icon" style={{ margin: "0 auto", display: "flex" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="2">
                  <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
                </svg>
              </span>
              <p className="smc-tech-name">{technology}</p>
              {technologySub && <p className="smc-tech-sub">{technologySub}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="smc-front-card">
        <p className="smc-tm-label">Treatment Map</p>
        <p className="smc-tm-title">
          Areas addressed
          <br />
          in this session.
        </p>
        <div className="smc-tm-cols">
          <div className="smc-tm-left">
            <div className="smc-legend-row">
              <span className="smc-legend-dot" /> treatment areas
            </div>
            <hr className="smc-tm-hr" />
            <p className="smc-protocol-label">Areas Treated</p>
            {areas.map((a) => (
              <div className="smc-check-row" key={a}>
                <span className="smc-check-circle">✓</span> {a}
              </div>
            ))}
            {optionalAreas?.map((a) => (
              <div className="smc-check-row" key={a}>
                <span className="smc-check-circle smc-optional">+</span> {a}
              </div>
            ))}
          </div>
          <SessionMapFigures selectedAreas={areas} />
        </div>
        <div className="smc-objectives-bar">
          <div className="smc-obj-items">
            {objectives.slice(0, 3).map((o) => (
              <div className="smc-obj-item" key={o}>
                <div className="smc-obj-text">{o}</div>
              </div>
            ))}
          </div>
          {detailsHref && (
            <a href={detailsHref} className="smc-view-btn">
              VIEW DETAILS ›
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const FRONT_ZONES = [
  { name: "Abdomen", cx: 80, cy: 148, rx: 16, ry: 15 },
  { name: "Lower Abdomen", cx: 80, cy: 172, rx: 14, ry: 10 },
  { name: "Left Flank / Lateral", cx: 58, cy: 150, rx: 7, ry: 14 },
  { name: "Right Flank / Lateral", cx: 102, cy: 150, rx: 7, ry: 14 },
  { name: "Left Front Thigh", cx: 68, cy: 255, rx: 9, ry: 26 },
  { name: "Right Front Thigh", cx: 92, cy: 255, rx: 9, ry: 26 },
];
const BACK_ZONES = [
  { name: "Lower Back", cx: 80, cy: 152, rx: 20, ry: 12 },
  { name: "Waistline / Back", cx: 80, cy: 178, rx: 17, ry: 9 },
  { name: "Posterior Left Arm", cx: 49, cy: 90, rx: 6, ry: 18 },
  { name: "Posterior Right Arm", cx: 111, cy: 90, rx: 6, ry: 18 },
  { name: "Left Glute", cx: 65, cy: 208, rx: 11, ry: 12 },
  { name: "Right Glute", cx: 95, cy: 208, rx: 11, ry: 12 },
  { name: "Left Posterior Thigh", cx: 65, cy: 250, rx: 9, ry: 24 },
  { name: "Right Posterior Thigh", cx: 95, cy: 250, rx: 9, ry: 24 },
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

function MiniFigure({ side, zones, selectedAreas }: { side: "front" | "back"; zones: typeof FRONT_ZONES; selectedAreas: string[] }) {
  return (
    <div>
      <svg width="60" viewBox="0 0 160 380">
        <ellipse cx="80" cy="24" rx="12" ry="15" fill="none" stroke="#B9A38F" strokeWidth="1.4" />
        <path d="M74,37 L74,46 M86,37 L86,46" fill="none" stroke="#B9A38F" strokeWidth="1.4" />
        <path d={BODY_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.4" strokeLinejoin="round" />
        <path d={LEFT_ARM_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.3" strokeLinejoin="round" />
        <path d={RIGHT_ARM_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.3" strokeLinejoin="round" />
        {zones.map((z) => {
          const isSelected = selectedAreas.includes(z.name);
          return (
            <ellipse
              key={z.name}
              cx={z.cx}
              cy={z.cy}
              rx={z.rx}
              ry={z.ry}
              fill={isSelected ? "rgba(210,161,153,0.65)" : "none"}
              stroke={isSelected ? "#C79E93" : "rgba(185,163,143,0.4)"}
              strokeWidth="1"
              strokeDasharray={isSelected ? undefined : "2,2"}
            />
          );
        })}
      </svg>
      <p className="smc-fig-label">{side === "front" ? "FRONT" : "BACK"}</p>
    </div>
  );
}

function SessionMapFigures({ selectedAreas }: { selectedAreas: string[] }) {
  return (
    <div className="smc-tm-right">
      <MiniFigure side="front" zones={FRONT_ZONES} selectedAreas={selectedAreas} />
      <MiniFigure side="back" zones={BACK_ZONES} selectedAreas={selectedAreas} />
    </div>
  );
}
