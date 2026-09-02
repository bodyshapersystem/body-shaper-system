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
  { name: "Abdomen", path: "M50,148 C60,140 100,140 110,148 C113,158 111,170 104,178 C88,170 72,170 56,178 C49,170 47,158 50,148 Z" },
  { name: "Lower Abdomen", path: "M56,178 C72,170 88,170 104,178 C102,188 96,197 80,199 C64,197 58,188 56,178 Z" },
  { name: "Left Flank / Lateral", path: "M50,148 C46,155 46,164 50,172 L56,178 C52,170 51,159 54,150 Z" },
  { name: "Right Flank / Lateral", path: "M110,148 C114,155 114,164 110,172 L104,178 C108,170 109,159 106,150 Z" },
];
const BACK_ZONES = [
  { name: "Lower Back", path: "M52,152 C64,144 96,144 108,152 C111,161 109,170 103,177 C88,170 72,170 57,177 C51,170 49,161 52,152 Z" },
  { name: "Posterior Left Arm", path: "M46,92 C43,102 42,115 43,127 L50,126 C49,114 50,102 53,92 Z" },
  { name: "Posterior Right Arm", path: "M114,92 C117,102 118,115 117,127 L110,126 C111,114 110,102 107,92 Z" },
  { name: "Left Glute", path: "M58,182 C65,178 78,177 80,182 L79,205 C70,208 62,204 58,196 Z" },
  { name: "Right Glute", path: "M102,182 C95,178 82,177 80,182 L81,205 C90,208 98,204 102,196 Z" },
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

function MiniFigure({ side, zones, selectedAreas }: { side: "front" | "back"; zones: typeof FRONT_ZONES; selectedAreas: string[] }) {
  return (
    <div>
      <svg width="60" viewBox="0 0 160 390">
        <ellipse cx="80" cy="8" rx="6" ry="5" fill="none" stroke="#B9A38F" strokeWidth="1.2" />
        <ellipse cx="80" cy="26" rx="12" ry="15" fill="none" stroke="#B9A38F" strokeWidth="1.2" />
        <path d="M69,17 C61,24 58,38 61,52" fill="none" stroke="#B9A38F" strokeWidth="1.2" />
        <path d="M91,17 C99,24 102,38 99,52" fill="none" stroke="#B9A38F" strokeWidth="1.2" />
        <path d="M74,39 L74,48 M86,39 L86,48" fill="none" stroke="#B9A38F" strokeWidth="1.2" />
        <path d={BODY_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={LEFT_ARM_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.1" strokeLinejoin="round" />
        <path d={RIGHT_ARM_PATH} fill="none" stroke="#B9A38F" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M50,380 Q52,386 60,386 L62,380 Z" fill="none" stroke="#B9A38F" strokeWidth="1.1" />
        <path d="M110,380 Q108,386 100,386 L98,380 Z" fill="none" stroke="#B9A38F" strokeWidth="1.1" />
        {zones.map((z) => {
          const isSelected = selectedAreas.includes(z.name);
          return (
            <path
              key={z.name}
              d={z.path}
              fill={isSelected ? "rgba(199,158,147,0.8)" : "none"}
              stroke={isSelected ? "none" : "rgba(185,163,143,0.4)"}
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
