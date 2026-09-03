"use client";

/**
 * Real, tappable Session body map — reuses two real illustration
 * assets already in the codebase, per direction, instead of a
 * hand-drawn SVG figure (several hand-drawn attempts kept reading as
 * crude/wrong). Torso + arms use Daily Trackers' Peptide Journey™
 * injection-site picker (/images/injection-site-base.png) — region
 * coordinates for Left/Right Arm and Left/Right Glute are the exact
 * same measured percentages already used by InjectionSiteDiagram;
 * Lower Back is a new region measured against this same image. The
 * two abdomen halves visible in the image both toggle the single
 * real "Abdomen" area, since the image doesn't visually distinguish
 * separate lateral/flank zones.
 *
 * Legs use the real front-view illustration from Blueprint's
 * Measurements diagram (/images/blueprint/measurements-diagram.jpeg),
 * cropped via CSS to its lower half (hips-to-feet) and measured for
 * real thigh/calf tap regions — verified visually before shipping.
 */

const TORSO_REGIONS: { name: string; left: number; top: number; width: number; height: number }[] = [
  { name: "Posterior Left Arm", left: 4.5, top: 24, width: 7, height: 34 },
  { name: "Abdomen", left: 18.5, top: 28, width: 10.5, height: 52 },
  { name: "Abdomen", left: 29, top: 28, width: 11, height: 52 },
  { name: "Lower Back", left: 58, top: 34, width: 16, height: 20 },
  { name: "Left Glute", left: 56.5, top: 56, width: 9, height: 34 },
  { name: "Right Glute", left: 65.5, top: 56, width: 9, height: 34 },
  { name: "Posterior Right Arm", left: 87.5, top: 24, width: 7, height: 34 },
];

const LEG_REGIONS: { name: string; left: number; top: number; width: number; height: number }[] = [
  { name: "Right Front Thigh", left: 30, top: 15, width: 16, height: 38 },
  { name: "Left Front Thigh", left: 54, top: 15, width: 16, height: 38 },
  { name: "Right Calf", left: 32, top: 58, width: 13, height: 35 },
  { name: "Left Calf", left: 55, top: 58, width: 13, height: 35 },
];

export default function SessionBodyMap({
  selectedAreas,
  onToggleArea,
}: {
  selectedAreas: Set<string>;
  onToggleArea: (area: string) => void;
}) {
  return (
    <div>
      <p className="dtj-field-label">Torso &amp; Arms</p>
      <div className="isd-photo-wrap">
        <img src="/images/injection-site-base.png" alt="Body diagram for torso and arm treatment areas" className="isd-photo-img" />
        {TORSO_REGIONS.map((r, i) => {
          const selected = selectedAreas.has(r.name);
          return (
            <button
              key={`${r.name}-${i}`}
              type="button"
              className="isd-photo-region"
              style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }}
              onClick={() => onToggleArea(r.name)}
              aria-label={r.name}
            >
              <span className={`isd-photo-highlight ${selected ? "isd-photo-highlight-selected" : ""}`} />
              {selected && <span className="isd-photo-check">✓</span>}
            </button>
          );
        })}
      </div>

      <p className="dtj-field-label" style={{ marginTop: 16 }}>Legs</p>
      <div className="sbm-legs-wrap">
        <img src="/images/blueprint/measurements-diagram.jpeg" alt="Body diagram for leg treatment areas" className="sbm-legs-img" />
        {LEG_REGIONS.map((r) => {
          const selected = selectedAreas.has(r.name);
          return (
            <button
              key={r.name}
              type="button"
              className="isd-photo-region"
              style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }}
              onClick={() => onToggleArea(r.name)}
              aria-label={r.name}
            >
              <span className={`isd-photo-highlight ${selected ? "isd-photo-highlight-selected" : ""}`} />
              {selected && <span className="isd-photo-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
