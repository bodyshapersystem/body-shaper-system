"use client";

import type { MeasurementCallout } from "@/lib/progress-photo-callouts";
import { formatLength, type LengthUnit } from "@/lib/units";

/**
 * The real Final Comparison "after" photo with 3 champagne connector
 * lines pointing from the actual measured body regions to pill
 * labels showing the real deltas (current − baseline). Which 3
 * measurements appear is entirely driven by real data (top 3 by
 * magnitude, from getMeasurementCallouts) — never hardcoded to
 * waist/abdomen/hips; a legs-and-abdomen case shows exactly that
 * instead, whatever the real numbers say.
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
  // Evenly spaced regardless of the label's real anatomical position —
  // without body-landmark detection, trying to place dots at precise
  // anatomical heights (e.g. waist vs. hips only ~8% apart) causes the
  // pill labels (each ~40px tall) to overlap. Values themselves stay
  // 100% real; only the vertical spacing of the on-photo dots is
  // simplified for legibility.
  const count = callouts.length;
  const topFor = (i: number) => (count === 1 ? 46 : 18 + (i * (64 / Math.max(count - 1, 1))));

  return (
    <div className="pmc-wrap">
      <img src={photoUrl} alt="After" className="pmc-photo" />
      {callouts.map((c, i) => {
        const topPercent = topFor(i);
        const dotLeftPercent = 40 + (i % 2 === 0 ? 6 : -6); // slight stagger so dots don't sit in a straight vertical line
        return (
          <div key={c.label} className="pmc-callout" style={{ top: `${topPercent}%` }}>
            <span className="pmc-dot" style={{ left: `${dotLeftPercent}%` }} />
            <span className="pmc-line" style={{ left: `${dotLeftPercent}%` }} />
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
