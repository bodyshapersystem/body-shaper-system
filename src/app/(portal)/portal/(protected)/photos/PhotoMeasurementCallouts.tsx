"use client";

import type { MeasurementCallout } from "@/lib/progress-photo-callouts";
import { formatLength, type LengthUnit } from "@/lib/units";

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
  // Evenly spaced with generous vertical separation — with only 2
  // measurements now (per direction: show exactly the most relevant
  // pair), there's plenty of room to keep them clearly apart.
  const count = callouts.length;
  const topFor = (i: number) => (count === 1 ? 46 : 22 + i * 46);

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
