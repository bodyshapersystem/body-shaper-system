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
