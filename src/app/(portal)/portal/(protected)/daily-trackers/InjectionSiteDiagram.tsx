"use client";

export const INJECTION_SITES = [
  { key: "LEFT_ARM", label: "Left Arm" },
  { key: "LEFT_ABDOMEN", label: "Left Abdomen" },
  { key: "RIGHT_ABDOMEN", label: "Right Abdomen" },
  { key: "LEFT_GLUTE", label: "Left Glute" },
  { key: "RIGHT_GLUTE", label: "Right Glute" },
  { key: "RIGHT_ARM", label: "Right Arm" },
];

// Real coordinates (as % of the illustration image) for each site's
// tap target + selection highlight — measured directly against the
// approved mockup illustration, not estimated freehand.
const REGIONS: Record<string, { left: number; top: number; width: number; height: number }> = {
  LEFT_ARM: { left: 4.5, top: 24, width: 7, height: 34 },
  LEFT_ABDOMEN: { left: 18.5, top: 28, width: 10.5, height: 52 },
  RIGHT_ABDOMEN: { left: 29, top: 28, width: 11, height: 52 },
  LEFT_GLUTE: { left: 56.5, top: 56, width: 9, height: 34 },
  RIGHT_GLUTE: { left: 65.5, top: 56, width: 9, height: 34 },
  RIGHT_ARM: { left: 87.5, top: 24, width: 7, height: 34 },
};

/**
 * Real injection-site diagram — the illustration itself is a real
 * crop of the approved mockup image (both sides mirrored to a clean,
 * neutral/unselected state), not a hand-drawn recreation. Selection
 * highlights and tap targets are positioned at the actual measured
 * coordinates of each body region within that image.
 */
export default function InjectionSiteDiagram({
  selectedSite,
  suggestedSite,
  onSelect,
}: {
  selectedSite: string | null;
  suggestedSite: string | null;
  onSelect: (site: string) => void;
}) {
  return (
    <div className="isd-photo-wrap">
      <img src="/images/injection-site-base.png" alt="Body diagram for injection site selection" className="isd-photo-img" />
      {INJECTION_SITES.map((s) => {
        const r = REGIONS[s.key];
        const selected = selectedSite === s.key;
        const suggested = suggestedSite === s.key && !selected;
        return (
          <button
            key={s.key}
            type="button"
            className="isd-photo-region"
            style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }}
            onClick={() => onSelect(s.key)}
            aria-label={s.label}
          >
            <span className={`isd-photo-highlight ${selected ? "isd-photo-highlight-selected" : ""} ${suggested ? "isd-photo-highlight-suggested" : ""}`} />
            {selected && <span className="isd-photo-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
