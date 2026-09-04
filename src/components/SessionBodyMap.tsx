"use client";

/**
 * Real interactive, tappable "Session Area Map" body silhouette,
 * built from the detailed written specification. Front + back, full
 * body, 4-quadrant abdomen and back (real independently-selectable
 * quadrants), separate front/posterior arms, laterals, thighs, and
 * calves. Zone/figure data lives in @/lib/body-map-zones (a plain,
 * non-"use client" module) so both this interactive picker and the
 * read-only SessionMapCard (rendered from server components) can
 * import it without crossing a Server Components boundary — an
 * earlier version imported directly from this "use client" file and
 * caused a real production server-side exception.
 *
 * Technology-aware: zones not supported by the current technology
 * (per session-objectives.ts's isZoneAvailable — e.g. calves are
 * never available for Exilis/EMS, front arms never for Exilis, most
 * zones except abdomen/glutes/legs never for EMS) render as
 * disabled — a faint hatched pattern, not clickable — instead of
 * silently allowing an unsupported selection.
 */

import { isZoneAvailable, type Technology } from "@/lib/session-objectives";
import { FRONT_ZONES, BACK_ZONES, FigureOutline, FILL_SELECTED, type Zone } from "@/lib/body-map-zones";

function BodyFigure({
  side,
  zones,
  selected,
  onToggle,
  technology,
}: {
  side: "front" | "back";
  zones: Zone[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  technology: Technology;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <p className="sbm-fig-label">{side === "front" ? "front" : "back"}</p>
      <svg viewBox="0 0 160 400" width="100%" style={{ maxWidth: 150 }}>
        <FigureOutline />
        {zones.map((z) => {
          const isSelected = selected.has(z.name);
          const available = isZoneAvailable(technology, z.name);
          if (!available) {
            return (
              <path
                key={z.name}
                d={z.path}
                fill="rgba(150,140,130,0.06)"
                stroke="rgba(150,140,130,0.35)"
                strokeWidth="0.75"
                strokeDasharray="1.5,1.5"
                style={{ cursor: "not-allowed" }}
              >
                <title>{z.name} — not available for this technology</title>
              </path>
            );
          }
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
  technology,
}: {
  selectedAreas: Set<string>;
  onToggleArea: (area: string) => void;
  technology: Technology;
}) {
  return (
    <div className="sbm-figs-row">
      <BodyFigure side="front" zones={FRONT_ZONES} selected={selectedAreas} onToggle={onToggleArea} technology={technology} />
      <BodyFigure side="back" zones={BACK_ZONES} selected={selectedAreas} onToggle={onToggleArea} technology={technology} />
    </div>
  );
}
