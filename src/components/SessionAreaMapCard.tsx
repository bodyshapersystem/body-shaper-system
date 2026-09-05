import { FRONT_ZONES, BACK_ZONES, FRONT_IMAGE, BACK_IMAGE, IMAGE_VIEWBOX, IMAGE_WIDTH, IMAGE_HEIGHT, FILL_SELECTED } from "@/lib/body-map-zones";
import { TECHNOLOGIES, groupSelectedAreas } from "@/lib/session-objectives";

/**
 * Real, read-only "Session Area Map™" for the Client Portal. The base
 * artwork is Emmy's own reference image (an <img>, not redrawn SVG —
 * see body-map-zones.tsx for provenance), with a transparent zone
 * overlay on top showing which areas were treated. Deliberately
 * server-safe (no "use client"): plain <img> + <svg> need no
 * interactivity here, so this renders fine from a Server Component.
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
        {([["front", FRONT_ZONES, FRONT_IMAGE], ["back", BACK_ZONES, BACK_IMAGE]] as const).map(([side, zones, image]) => (
          <div key={side} style={{ textAlign: "center" }}>
            <p className="sbm-fig-label">{side}</p>
            <div style={{ position: "relative", width: "100%", maxWidth: 150, margin: "0 auto" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={`${side} body map`} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ width: "100%", height: "auto", display: "block" }} />
              <svg viewBox={IMAGE_VIEWBOX} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                {zones.map((z) => {
                  const isSelected = selected.has(z.name);
                  return (
                    <path
                      key={z.name}
                      d={z.path}
                      fill={isSelected ? FILL_SELECTED : "rgba(0,0,0,0.001)"}
                      stroke={isSelected ? "none" : "rgba(185,163,143,0.3)"}
                      strokeWidth="1.5"
                      strokeDasharray={isSelected ? undefined : "4,4"}
                    />
                  );
                })}
              </svg>
            </div>
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
