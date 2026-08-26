"use client";

import type { MeasurementCallout } from "@/lib/progress-photo-callouts";
import { formatLength, type LengthUnit } from "@/lib/units";

// Real anatomical position (as % of photo height) for each of the 5
// possible labels this can show — waist sits higher (the natural
// waistline), abdomen lower (below the navel), hips lower still, and
// the thigh lower than that. Only ever 2 of these show at once
// (getFinalComparisonPair picks the pair), with enough vertical gap
// between any pair to keep both pills legible.
const VERTICAL_POSITION: Record<string, number> = {
  Waist: 32,
  Abdomen: 58,
  Hips: 42,
  "Right Thigh": 70,
  "Left Thigh": 70,
};

/**
 * The real Final Comparison "after" photo with 2 champagne connector
 * lines pointing from the actual measured body regions to pill
 * labels showing the real deltas (current − baseline). Which 2
 * measurements appear is entirely driven by real data — Waist +
 * Abdomen by default, or Hips + the more-changed thigh for a
 * legs-focused case (getFinalComparisonPair) — never invented.
 */
export default function PhotoMeasurementCallouts({
  photoUrl,
  callouts,
  unit,
}: {
  photoUrl: string;
  callouts: MeasurementCallout[];
  unit: LengthUnit;
}) {
  const topFor = (label: string, i: number) => VERTICAL_POSITION[label] ?? 22 + i * 46;

  return (
    <div className="pmc-wrap">
      <img src={photoUrl} alt="After" className="pmc-photo" />
      {callouts.map((c, i) => {
        const topPercent = topFor(c.label, i);
        const dotLeftPercent = 40 + (i % 2 === 0 ? 6 : -6); // slight stagger so dots don't sit in a straight vertical line
        return (
          <div key={c.label} className="pmc-callout" style={{ top: `${topPercent}%` }}>
            <span className="pmc-dot" style={{ left: `${dotLeftPercent}%` }} />
            <svg
              className="pmc-line-svg"
              style={{ left: `${dotLeftPercent}%`, width: `calc(100% - ${dotLeftPercent}% + 118px)` }}
              viewBox="0 0 118 20"
              preserveAspectRatio="none"
            >
              <path d="M0,10 Q30,2 59,10 T118,10" stroke="#C8A15A" strokeWidth="1" fill="none" opacity="0.75" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="pmc-pill">
              <span className="pmc-pill-label">{c.label}</span>
              <span className="pmc-pill-value">
                {c.deltaCm > 0 ? "+" : ""}
                {formatLength(c.deltaCm, unit)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
