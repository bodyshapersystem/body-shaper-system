import { FRONT_ZONES, BACK_ZONES, FrontFigureOutline, BackFigureOutline, FILL_SELECTED } from "@/lib/body-map-zones";
import { TECHNOLOGIES, groupSelectedAreas } from "@/lib/session-objectives";

/**
 * Real, read-only "Session Area Map™" — the exact page Emmy approved
 * (7 real app-screen renders, reviewed directly), now surfaced in the
 * Client Portal for a completed session. Deliberately server-safe (no
 * "use client"): imports the same FRONT_ZONES/BACK_ZONES/FigureOutline
 * used by the interactive Hub picker (SessionBodyMap) so the client's
 * historical view can never visually drift from what the specialist
 * actually selected — one shared source of figure data, two renderers
 * (one interactive, one not).
 *
 * No click handlers and no "save session" bar here — this is a frozen
 * historical record, not an editor.
 */
export default function SessionAreaMapCard({
  technology,
  areas,
  objectives,
  notes,
  dateLabel,
  blueprintAlignment,
}: {
  technology: string;
  areas: string[];
  objectives: string[];
  notes?: string | null;
  dateLabel?: string;
  blueprintAlignment?: { matched: string[]; unmatched: string[] } | null;
}) {
  const areaPills = groupSelectedAreas(areas);
  const selected = new Set(areas);

  return (
    <div className="bp-summary-card">
      <p className="sbm-brand">body shaper system™</p>
      <h3 className="bp-sheet-title" style={{ textAlign: "center", marginBottom: 4 }}>
        session area map
      </h3>
      {dateLabel && (
        <p className="pay-history-meta" style={{ textAlign: "center", marginBottom: 16 }}>{dateLabel}</p>
      )}

      <div className="pp-angle-switch" style={{ justifyContent: "center", marginBottom: 16 }}>
        {TECHNOLOGIES.map((t) => (
          <span
            key={t}
            className={`sam-tech-pill-static ${technology.toLowerCase() === t.toLowerCase() ? "sam-tech-pill-active" : ""}`}
          >
            {t.toLowerCase()}
          </span>
        ))}
      </div>

      <div className="sbm-figs-row">
        {([["front", FRONT_ZONES], ["back", BACK_ZONES]] as const).map(([side, zones]) => (
          <div key={side} style={{ textAlign: "center" }}>
            <p className="sbm-fig-label">{side}</p>
            <svg viewBox="0 0 160 400" width="100%" style={{ maxWidth: 150 }}>
              {side === "front" ? <FrontFigureOutline /> : <BackFigureOutline />}
              {zones.map((z) => {
                const isSelected = selected.has(z.name);
                return (
                  <path
                    key={z.name}
                    d={z.path}
                    fill={isSelected ? FILL_SELECTED : "rgba(0,0,0,0.001)"}
                    stroke={isSelected ? "none" : "rgba(185,163,143,0.3)"}
                    strokeWidth="1"
                    strokeDasharray={isSelected ? undefined : "2,2"}
                  />
                );
              })}
            </svg>
          </div>
        ))}
      </div>

      <p className="dtj-field-label" style={{ marginTop: 14 }}>selected areas</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {areaPills.length === 0 ? (
          <p className="pay-history-meta">No treated areas recorded for this session.</p>
        ) : (
          areaPills.map(({ label }) => (
            <span key={label} className="sam-area-pill">{label.toLowerCase()}</span>
          ))
        )}
      </div>

      <p className="dtj-field-label">Auto-Generated Objective</p>
      {objectives.length > 0 ? (
        objectives.map((sentence) => (
          <p key={sentence} className="pay-history-meta" style={{ marginBottom: 8, fontStyle: "italic" }}>{sentence}</p>
        ))
      ) : (
        <p className="pay-history-meta" style={{ marginBottom: 8 }}>No objective recorded for this session.</p>
      )}

      {blueprintAlignment && blueprintAlignment.matched.length > 0 && (
        <>
          <p className="dtj-field-label" style={{ marginTop: 8 }}>Blueprint Alignment™</p>
          <p className="pjic-status-active" style={{ marginBottom: 6 }}>
            Aligned with {blueprintAlignment.matched.length} current goal{blueprintAlignment.matched.length === 1 ? "" : "s"} ✓
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {blueprintAlignment.matched.map((g) => (
              <span key={g} className="sam-area-pill">{g.toLowerCase()}</span>
            ))}
          </div>
          <p className="pay-history-meta" style={{ marginBottom: 8 }}>
            This session supports priorities identified in your Body Blueprint™.
          </p>
        </>
      )}

      {notes && (
        <>
          <p className="dtj-field-label" style={{ marginTop: 8 }}>Specialist Notes</p>
          <p className="pay-history-meta">{notes}</p>
        </>
      )}
    </div>
  );
}
