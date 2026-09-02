"use client";

/**
 * Real, tappable Session body map — reuses the exact same real
 * illustration asset already used by Daily Trackers' Peptide
 * Journey™ injection-site picker (/images/injection-site-base.png),
 * per direction, instead of a hand-drawn SVG figure (several
 * hand-drawn attempts kept reading as crude/wrong). Region
 * coordinates for Left/Right Arm and Left/Right Glute are the exact
 * same measured percentages already used by InjectionSiteDiagram;
 * Lower Back is a new region measured directly against this same
 * image and verified visually before shipping. The two abdomen
 * halves visible in the image both toggle the single real "Abdomen"
 * area, since the image doesn't visually distinguish separate
 * lateral/flank zones.
 *
 * Leg areas (thighs, knees, calves) aren't part of this torso+arms
 * illustration, so they're offered as plain selectable chips below
 * the image rather than invented shapes on a figure that doesn't
 * show legs.
 */

const IMAGE_REGIONS: { name: string; left: number; top: number; width: number; height: number }[] = [
  { name: "Posterior Left Arm", left: 4.5, top: 24, width: 7, height: 34 },
  { name: "Abdomen", left: 18.5, top: 28, width: 10.5, height: 52 },
  { name: "Abdomen", left: 29, top: 28, width: 11, height: 52 },
  { name: "Lower Back", left: 58, top: 34, width: 16, height: 20 },
  { name: "Left Glute", left: 56.5, top: 56, width: 9, height: 34 },
  { name: "Right Glute", left: 65.5, top: 56, width: 9, height: 34 },
  { name: "Posterior Right Arm", left: 87.5, top: 24, width: 7, height: 34 },
];

const CHIP_AREAS = ["Left Front Thigh", "Right Front Thigh", "Left Posterior Thigh", "Right Posterior Thigh", "Inner Thighs", "Outer Thighs", "Knees", "Calves"];

export default function SessionBodyMap({
  selectedAreas,
  onToggleArea,
}: {
  selectedAreas: Set<string>;
  onToggleArea: (area: string) => void;
}) {
  return (
    <div>
      <div className="isd-photo-wrap">
        <img src="/images/injection-site-base.png" alt="Body diagram for treatment area selection" className="isd-photo-img" />
        {IMAGE_REGIONS.map((r, i) => {
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
      <p className="dtj-field-label" style={{ marginTop: 14 }}>Legs (not shown above)</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CHIP_AREAS.map((area) => {
          const selected = selectedAreas.has(area);
          return (
            <button
              key={area}
              type="button"
              className={`pp-angle-pill ${selected ? "pp-angle-pill-active" : ""}`}
              onClick={() => onToggleArea(area)}
            >
              {area}
            </button>
          );
        })}
      </div>
    </div>
  );
}
