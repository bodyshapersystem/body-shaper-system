import { FRONT_ZONES, BACK_ZONES, FigureOutline } from "@/lib/body-map-zones";

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
              <filter id="smc-glow">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="smc-wine-tex" patternUnits="userSpaceOnUse" width="340" height="150">
                <image href="/images/rewards/burgundy-marble-2.jpg" x="-60" y="-140" width="460" height="430" preserveAspectRatio="xMidYMid slice" />
              </pattern>
              <pattern id="smc-stone-tex" patternUnits="userSpaceOnUse" width="340" height="150">
                <image href="/images/textures/taupe-marble-gold-waves.png" x="-500" y="-140" width="900" height="430" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
            <rect width="340" height="150" fill="url(#smc-stone-tex)" />
            <path d="M0,0 L235,0 C210,25 205,45 220,65 C238,88 248,105 240,130 C236,140 232,145 235,150 L0,150 Z" fill="url(#smc-wine-tex)" />
            <path
              d="M235,0 C210,25 205,45 220,65 C238,88 248,105 240,130 C236,140 232,145 235,150"
              fill="none"
              stroke="#E8C77E"
              strokeWidth="1.6"
              opacity="0.9"
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
        <div className="smc-legend-row">
          <span className="smc-legend-dot" /> treatment areas
        </div>
        <SessionMapFigures selectedAreas={areas} />
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

/**
 * Real, read-only display of the exact same hand-drawn silhouette
 * used by SessionBodyMap (the interactive picker) -- imported
 * directly (FRONT_ZONES/BACK_ZONES/FigureOutline) so the read-only
 * historical view can never drift out of sync with the interactive
 * one. Highlights whichever real areas this session actually
 * treated; no click handlers since this is a historical record, not
 * an editor.
 */
function SessionMapFigures({ selectedAreas }: { selectedAreas: string[] }) {
  return (
    <div className="sbm-figs-row" style={{ marginBottom: 14 }}>
      {([["front", FRONT_ZONES], ["back", BACK_ZONES]] as const).map(([side, zones]) => (
        <div key={side} style={{ textAlign: "center" }}>
          <p className="sbm-fig-label">{side}</p>
          <svg viewBox="0 0 160 400" width="100%" style={{ maxWidth: 130 }}>
            <FigureOutline />
            {zones.map((z) => {
              const selected = selectedAreas.includes(z.name);
              if (!selected) return null;
              return <path key={z.name} d={z.path} fill="rgba(199,158,147,0.8)" stroke="none" />;
            })}
          </svg>
        </div>
      ))}
    </div>
  );
}
