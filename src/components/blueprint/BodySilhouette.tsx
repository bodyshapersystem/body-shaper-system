"use client";

import { BODY_ZONES } from "@/lib/blueprint-body-zones";

/**
 * Interactive silhouette (front + back) drawn on Emmy's official Session Area Map mannequin.
 * Each region is an independent SVG path clipped to the real anatomical contour of the
 * illustration. Tapping a region toggles the same value as its card (multi-select).
 */
export const BODY_AREAS = ["Abdomen", "Waist", "Flanks", "Back", "Arms", "Inner Thighs", "Outer Thighs", "Glutes", "Hips", "Knees", "Chin / Jawline", "Face", "Full Body", "Other"] as const;
export const MAPPABLE = BODY_AREAS.filter((a) => a !== "Full Body" && a !== "Other");

const IMG = { front: "/proposal-assets/blueprint/session-area-map/front.png", back: "/proposal-assets/blueprint/session-area-map/back.png" };

export default function BodySilhouette({ selected, onToggle }: { selected: string[]; onToggle: (area: string) => void }) {
  const lit = new Set(selected.includes("Full Body") ? MAPPABLE : selected);
  return (
    <div className="bs" role="group" aria-label="tap the areas you would like to work on">
      {(["front", "back"] as const).map((side) => (
        <figure key={side} className="bs-fig">
          <figcaption>{side}</figcaption>
          <div className="bs-art">
            <img src={IMG[side]} alt="" width={BODY_ZONES.width} height={BODY_ZONES.height} draggable={false} />
            <svg viewBox={`0 0 ${BODY_ZONES.width} ${BODY_ZONES.height}`}>
              <defs>
                <linearGradient id={`bs-grad-${side}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f3dfbb" />
                  <stop offset="1" stopColor="#d9b98a" />
                </linearGradient>
              </defs>
              {BODY_ZONES[side].zones.map((z) => {
                const on = lit.has(z.area);
                return (
                  <path
                    key={z.area}
                    d={z.d}
                    pathLength={1}
                    className={`bs-zone${on ? " on" : ""}`}
                    style={on ? { fill: `url(#bs-grad-${side})` } : undefined}
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`${z.area.toLowerCase()} (${side})`}
                    tabIndex={0}
                    onClick={() => onToggle(z.area)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggle(z.area);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </figure>
      ))}
    </div>
  );
}
