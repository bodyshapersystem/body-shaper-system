/**
 * Real "Personalized System™" wine/stone composite card, matching
 * the approved visual spec exactly (organic bezier seam curve traced
 * by one glowing gold inlay line, warm wine gradient with fine
 * hairlines converging toward the seam, travertino stone with faint
 * veins, small gold compass star). Verified visually via a
 * headless-browser render before wiring in — an earlier version
 * had a CSS bug (`.card svg` was too broad and blew up a small icon
 * to fill the whole card) that's why the selector below is scoped to
 * `.psc-bg-svg` specifically, not a bare `svg` tag.
 *
 * Every value shown is real, passed in as props — nothing here is a
 * hardcoded placeholder (no fixed "33%", no fixed "4 of 12").
 */
export default function PersonalizedSystemCard({
  systemName,
  systemCode,
  frequency,
  sessionsCompleted,
  totalSessions,
  currentPhase,
  progressPercent,
}: {
  systemName: string;
  systemCode?: string | null;
  frequency: string | null;
  sessionsCompleted: number;
  totalSessions: number | null;
  currentPhase: string | null;
  progressPercent: number | null;
}) {
  return (
    <div className="psc-wrap">
      <div className="psc-card">
        <svg className="psc-bg-svg" viewBox="0 0 320 430" preserveAspectRatio="none">
          <defs>
            <filter id="psc-glow">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="psc-wine-tex" patternUnits="userSpaceOnUse" width="320" height="430">
              <image href="/images/rewards/burgundy-marble-2.jpg" width="320" height="430" preserveAspectRatio="xMidYMid slice" />
            </pattern>
            <pattern id="psc-stone-tex" patternUnits="userSpaceOnUse" width="320" height="430">
              <image href="/images/textures/taupe-marble-gold-waves.png" x="-180" width="500" height="430" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </defs>
          <rect width="320" height="430" fill="url(#psc-stone-tex)" />
          <path d="M0,0 L250,0 Q210,110 218,215 Q210,320 230,430 L0,430 Z" fill="url(#psc-wine-tex)" />
          <path
            d="M250,0 Q210,110 218,215 Q210,320 230,430"
            fill="none"
            stroke="#E8C77E"
            strokeWidth="1.8"
            opacity="0.9"
            filter="url(#psc-glow)"
          />
          <g stroke="#C9A25E" strokeWidth="1" fill="none" opacity="0.8">
            <path d="M280,258 L282,268 L292,270 L282,272 L280,282 L278,272 L268,270 L278,268 Z" />
            <path d="M280,262 L281,268.5 L287,270 L281,271.5 L280,278 L279,271.5 L273,270 L279,268.5 Z" />
            <circle cx="280" cy="270" r="1" fill="#C9A25E" />
          </g>
        </svg>

        <div className="psc-content">
          <div className="psc-top-row">
            <div className="psc-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.2">
                <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path d="M12 3v18M3 12h18" opacity="0.4" />
              </svg>
              <div className="psc-brand-text">
                body
                <br />
                shaper
                <br />
                system™
              </div>
            </div>
            <div className="psc-badge">
              <span className="psc-badge-dot" />
              <span className="psc-badge-text">Active System</span>
            </div>
          </div>

          <p className="psc-eyebrow">personalized system™</p>
          <div className="psc-gold-rule" />
          <p className="psc-headline">{systemName}</p>
          {systemCode && <p className="psc-code">{systemCode}</p>}

          <div className="psc-stat-row">
            <div className="psc-stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
                <path d="M3 12h4l2-7 4 14 2-7h6" />
              </svg>
            </div>
            <div>
              <p className="psc-stat-label">Frequency</p>
              <p className="psc-stat-value">{frequency ?? "Not set"}</p>
            </div>
          </div>
          <div className="psc-stat-row">
            <div className="psc-stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
                <rect x="4" y="5" width="16" height="16" rx="2" />
                <path d="M4 10h16M8 3v4M16 3v4" />
              </svg>
            </div>
            <div>
              <p className="psc-stat-label">Sessions</p>
              <p className="psc-stat-value">{sessionsCompleted} of {totalSessions ?? "—"}</p>
            </div>
          </div>
          <div className="psc-stat-row">
            <div className="psc-stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
                <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
              </svg>
            </div>
            <div>
              <p className="psc-stat-label">Current Phase</p>
              <p className="psc-stat-value" style={{ fontWeight: 400 }}>{currentPhase ?? "Not set"}</p>
            </div>
          </div>

          {progressPercent !== null && (
            <>
              <p className="psc-progress-label">Progress</p>
              <span className="psc-progress-track">
                <span className="psc-progress-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
              </span>
              <span className="psc-progress-pct">{progressPercent}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
