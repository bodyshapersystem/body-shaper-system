export type MeasurementCallout = { label: string; deltaCm: number; baselineCm: number; currentCm: number };

const FIELDS: { key: string; label: string }[] = [
  { key: "waistCm", label: "Waist" },
  { key: "lowerAbdomenCm", label: "Abdomen" },
  { key: "hipsCm", label: "Hips" },
  { key: "rightThighCm", label: "Right Thigh" },
  { key: "leftThighCm", label: "Left Thigh" },
  { key: "rightArmCm", label: "Right Arm" },
  { key: "leftArmCm", label: "Left Arm" },
  { key: "chestCm", label: "Bust" },
  { key: "neckCm", label: "Neck" },
  { key: "shoulderCm", label: "Shoulder" },
];

/**
 * Real measurement callouts for Progress Photos — change = current
 * measurement - baseline measurement, for every field that actually
 * has both a baseline and a current value (never invented). Ranked
 * by magnitude of real change and capped at 3, matching the spec's
 * "2-3 most relevant" direction. No focus-area concept exists in the
 * data model yet, so magnitude is the real, honest ranking signal.
 */
export function getMeasurementCallouts(
  baseline: Record<string, number | null> | null | undefined,
  current: Record<string, number | null> | null | undefined,
  max = 3
): MeasurementCallout[] {
  if (!baseline || !current) return [];
  const callouts: MeasurementCallout[] = [];
  for (const { key, label } of FIELDS) {
    const b = baseline[key];
    const c = current[key];
    if (b == null || c == null) continue;
    const deltaCm = c - b;
    if (Math.abs(deltaCm) < 0.1) continue;
    callouts.push({ label, deltaCm, baselineCm: b, currentCm: c });
  }
  return callouts.sort((a, b) => Math.abs(b.deltaCm) - Math.abs(a.deltaCm)).slice(0, max);
}

/**
 * Final Comparison pair — exactly 2 real measurements, matching one
 * of two canonical pairs: Waist + Abdomen (the default, abdomen-focus
 * case), or Hips + one Thigh (the legs-focus case, using whichever
 * thigh — right or left — actually has the bigger real change). Which
 * pair is shown is decided by real data: whichever pair's combined
 * real change is larger. Never invents a value; a pair only counts if
 * both its measurements have a real baseline-to-current delta.
 */
export function getFinalComparisonPair(
  baseline: Record<string, number | null> | null | undefined,
  current: Record<string, number | null> | null | undefined
): MeasurementCallout[] {
  const all = getMeasurementCallouts(baseline, current, FIELDS.length);
  const byLabel = new Map(all.map((c) => [c.label, c]));

  const waist = byLabel.get("Waist");
  const abdomen = byLabel.get("Abdomen");
  const hips = byLabel.get("Hips");
  const rightThigh = byLabel.get("Right Thigh");
  const leftThigh = byLabel.get("Left Thigh");
  const bestThigh = [rightThigh, leftThigh].filter((c): c is MeasurementCallout => !!c).sort((a, b) => Math.abs(b.deltaCm) - Math.abs(a.deltaCm))[0];

  const abdomenPair = waist && abdomen ? [waist, abdomen] : null;
  const legsPair = hips && bestThigh ? [hips, bestThigh] : null;

  const magnitude = (pair: MeasurementCallout[]) => pair.reduce((sum, c) => sum + Math.abs(c.deltaCm), 0);

  if (abdomenPair && legsPair) {
    return magnitude(abdomenPair) >= magnitude(legsPair) ? abdomenPair : legsPair;
  }
  if (abdomenPair) return abdomenPair;
  if (legsPair) return legsPair;

  // Neither canonical pair has complete real data — fall back to
  // whatever 2 real measurements changed the most, so the section
  // still shows something true rather than nothing.
  return all.slice(0, 2);
}
