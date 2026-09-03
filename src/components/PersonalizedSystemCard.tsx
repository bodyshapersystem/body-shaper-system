/**
 * Real "Personalized System™" wine/stone composite card — horizontal
 * orientation, matching the sibling cards in System Architecture
 * (System Architecture / Why This System Was Selected), which read
 * as landscape panels, not a tall portrait card. Earlier version used
 * a portrait 320x430 canvas that looked visually inconsistent next to
 * those wider panels; rebuilt at 420x260 with the wave curve/texture
 * recomputed for the new proportions, verified visually before
 * shipping. All Frequency/Sessions/Phase stats sit in a horizontal
 * row directly under the headline, confirmed to stay fully within
 * the wine (dark) area at every screen width — an earlier landscape
 * draft placed them beside the headline and they spilled onto the
 * light stone side, becoming illegible (gold-on-light-stone), the
 * same contrast bug already found and fixed once in Session Map's
 * Technology column.
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
        <svg className="psc-bg-svg" viewBox="0 0 420 260" preserveAspectRatio="none">
          <defs>
            <filter id="psc-glow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="psc-wine-tex" patternUnits="userSpaceOnUse" width="420" height="260">
              <image href="/images/rewards/burgundy-marble-2.jpg" width="420" height="260" preserveAspectRatio="xMidYMid slice" />
            </pattern>
            <pattern id="psc-stone-tex" patternUnits="userSpaceOnUse" width="420" height="260">
              <image href="/images/textures/taupe-marble-gold-waves.png" x="-100" width="600" height="260" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </defs>
          <rect width="420" height="260" fill="url(#psc-stone-tex)" />
          <path d="M0,0 L300,0 C270,25 258,42 264,62 C270,85 305,95 328,120 C345,138 335,165 312,185 C298,198 288,215 300,235 L300,260 L0,260 Z" fill="url(#psc-wine-tex)" />
          <path
            d="M300,0 C270,25 258,42 264,62 C270,85 305,95 328,120 C345,138 335,165 312,185 C298,198 288,215 300,235 L300,260"
            fill="none"
            stroke="#E8C77E"
            strokeWidth="1.8"
            opacity="0.9"
            filter="url(#psc-glow)"
          />
          <g stroke="#C9A25E" strokeWidth="1" fill="none" opacity="0.8">
            <path d="M370,150 L372,160 L382,162 L372,164 L370,174 L368,164 L358,162 L368,160 Z" />
          </g>
        </svg>

        <div className="psc-content">
          <div className="psc-top-row">
            <div className="psc-brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.2">
                <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path d="M12 3v18M3 12h18" opacity="0.4" />
              </svg>
              <div className="psc-brand-text">body shaper system™</div>
            </div>
            <div className="psc-badge">
              <span className="psc-badge-dot" />
              <span className="psc-badge-text">Active System</span>
            </div>
          </div>

          <p className="psc-eyebrow">personalized system™</p>
          <div className="psc-gold-rule" />

          <div className="psc-main-col">
            <p className="psc-headline">{systemName}</p>
            {systemCode && <p className="psc-code">{systemCode}</p>}

            <div className="psc-stat-row-group">
              <div className="psc-stat-row">
                <div className="psc-stat-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A25E" strokeWidth="1.5">
                    <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="psc-stat-label">Phase</p>
                  <p className="psc-stat-value" style={{ fontWeight: 400 }}>{currentPhase ?? "Not set"}</p>
                </div>
              </div>
            </div>

            {progressPercent !== null && (
              <div className="psc-progress-row">
                <span className="psc-progress-label">Progress</span>
                <span className="psc-progress-track">
                  <span className="psc-progress-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                </span>
                <span className="psc-progress-pct">{progressPercent}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
