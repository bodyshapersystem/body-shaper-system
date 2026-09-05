"use client";

/**
 * Real interactive, tappable "Session Area Map" body silhouette.
 * The base artwork is Emmy's own reference image (see body-map-zones.tsx
 * for provenance) rendered as a plain <img>, with an absolutely-
 * positioned, transparent SVG of the same pixel dimensions layered on
 * top to carry the clickable/shaded zone shapes. The image itself is
 * never redrawn or modified — only the invisible zone overlay is code.
 *
 * Unselected zones are FULLY invisible (no border, no dash, no hatch)
 * — a prior version drew a dashed outline over every zone as a
 * discoverability hint, which visually reconstructed the exact
 * dashed zone-template grid Emmy explicitly did not want to see
 * (confirmed directly from her screenshot: the dashed rectangles
 * lined up exactly with the zone paths, meaning they were this
 * overlay's own unselected-state styling, not anything left over in
 * the base image). A zone only becomes visible at all once selected.
 *
 * Technology-aware: zones not supported by the current technology
 * (per session-objectives.ts's isZoneAvailable) are also invisible
 * and non-interactive — no hatch pattern either, for the same reason.
 */

import { isZoneAvailable, type Technology } from "@/lib/session-objectives";
import { FRONT_ZONES, BACK_ZONES, FRONT_IMAGE, BACK_IMAGE, IMAGE_VIEWBOX, IMAGE_WIDTH, IMAGE_HEIGHT, FILL_SELECTED, type Zone } from "@/lib/body-map-zones";

function BodyFigure({
  side,
  image,
  zones,
  selected,
  onToggle,
  technology,
}: {
  side: "front" | "back";
  image: string;
  zones: Zone[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  technology: Technology;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <p className="sbm-fig-label">{side === "front" ? "front" : "back"}</p>
      <div style={{ position: "relative", width: "100%", maxWidth: 150, margin: "0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${side} body map`} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ width: "100%", height: "auto", display: "block" }} draggable={false} />
        <svg viewBox={IMAGE_VIEWBOX} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {zones.map((z) => {
            const isSelected = selected.has(z.name);
            const available = isZoneAvailable(technology, z.name);
            if (!available) {
              return (
                <path
                  key={z.name}
                  d={z.path}
                  fill="rgba(0,0,0,0.001)"
                  stroke="none"
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
                stroke="none"
                style={{ cursor: "pointer", touchAction: "manipulation" }}
                onClick={() => onToggle(z.name)}
              >
                <title>{z.name}</title>
              </path>
            );
          })}
        </svg>
      </div>
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
      <BodyFigure side="front" image={FRONT_IMAGE} zones={FRONT_ZONES} selected={selectedAreas} onToggle={onToggleArea} technology={technology} />
      <BodyFigure side="back" image={BACK_IMAGE} zones={BACK_ZONES} selected={selectedAreas} onToggle={onToggleArea} technology={technology} />
    </div>
  );
}
