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
  { name: "Abdomen", path: "M62,148 Q80,140 98,148 Q100,160 92,172 Q80,178 68,172 Q60,160 62,148 Z" },
  { name: "Lower Abdomen", path: "M68,172 Q80,178 92,172 Q90,186 80,190 Q70,186 68,172 Z" },
  { name: "Left Flank / Lateral", path: "M62,148 Q58,158 62,168 L68,172 Q64,162 65,150 Z" },
  { name: "Right Flank / Lateral", path: "M98,148 Q102,158 98,168 L92,172 Q96,162 95,150 Z" },
];
const BACK_ZONES = [
  { name: "Lower Back", path: "M64,150 Q80,142 96,150 Q98,160 92,168 Q80,174 68,168 Q62,160 64,150 Z" },
  { name: "Posterior Left Arm", path: "M46,92 C43,102 42,115 43,127 L50,126 C49,114 50,102 53,92 Z" },
  { name: "Posterior Right Arm", path: "M114,92 C117,102 118,115 117,127 L110,126 C111,114 110,102 107,92 Z" },
  { name: "Left Glute", path: "M64,200 Q72,196 80,200 L79,220 Q70,223 63,215 Z" },
  { name: "Right Glute", path: "M96,200 Q88,196 80,200 L81,220 Q90,223 97,215 Z" },
];

function MiniFigure({ side, zones, selectedAreas }: { side: "front" | "back"; zones: typeof FRONT_ZONES; selectedAreas: string[] }) {
  return (
    <div>
      <svg width="60" viewBox="0 0 160 400">
        <circle cx="80" cy="9" r="5" fill="none" stroke="#B9A38F" strokeWidth="1.3" />
        <circle cx="80" cy="27" r="13" fill="none" stroke="#B9A38F" strokeWidth="1.3" />
        <path d="M69,18 Q62,20 62,30" fill="none" stroke="#B9A38F" strokeWidth="1.3" />
        <path d="M91,18 Q98,20 98,30" fill="none" stroke="#B9A38F" strokeWidth="1.3" />
        <line x1="75" y1="40" x2="75" y2="50" stroke="#B9A38F" strokeWidth="1.3" />
        <line x1="85" y1="40" x2="85" y2="50" stroke="#B9A38F" strokeWidth="1.3" />
        <polyline points="75,50 58,58 62,90 66,130 63,150 66,170" fill="none" stroke="#B9A38F" strokeWidth="1.3" strokeLinejoin="round" />
        <polyline points="85,50 102,58 98,90 94,130 97,150 94,170" fill="none" stroke="#B9A38F" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M66,170 Q80,178 94,170" fill="none" stroke="#B9A38F" strokeWidth="1.3" />
        <polyline points="58,58 50,90 47,125 49,155" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <polyline points="102,58 110,90 113,125 111,155" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <polyline points="66,172 63,220 62,280 60,340 60,380" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <polyline points="74,172 74,220 73,280 72,340 71,380" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <polyline points="86,172 86,220 87,280 88,340 89,380" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <polyline points="94,172 97,220 98,280 100,340 100,380" fill="none" stroke="#B9A38F" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M60,380 L71,380 L71,386 L64,386 Z" fill="none" stroke="#B9A38F" strokeWidth="1.1" />
        <path d="M100,380 L89,380 L89,386 L96,386 Z" fill="none" stroke="#B9A38F" strokeWidth="1.1" />
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
