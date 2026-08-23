import { kgToLb, cmToIn } from "@/lib/units";

export type MetricChange = { label: string; deltaText: string; direction: "up" | "down" };

type CompositionSnapshot = {
  weightKg: number | null;
  bodyFatPercent: number | null;
  muscleMassKg: number | null;
  skeletalMuscleKg: number | null;
  bodyWaterPercent: number | null;
  visceralFat: number | null;
};

/**
 * Real positive-progress detection for Body Composition — gated by
 * the client's own stated Blueprint goal where it matters. Weight
 * loss is never assumed positive for every client; body fat/visceral
 * fat down and muscle/skeletal muscle up are treated as positive
 * regardless of goal wording (there's no body-contouring goal where
 * more visceral fat or less muscle is the aim). Body Water increasing
 * is treated as improved hydration by default.
 */
export function getPositiveCompositionChanges(
  latest: CompositionSnapshot,
  previous: CompositionSnapshot | null | undefined,
  goalsText: string,
  unit: "lb" | "kg"
): MetricChange[] {
  if (!previous) return [];
  const goals = goalsText.toLowerCase();
  const wantsWeightGain = /weight gain|bulk|mass gain/.test(goals);
  const changes: MetricChange[] = [];

  function weightLike(curr: number | null, prev: number | null): number | null {
    if (curr == null || prev == null) return null;
    const diffKg = curr - prev;
    return unit === "kg" ? diffKg : kgToLb(diffKg);
  }

  const weightDiff = weightLike(latest.weightKg, previous.weightKg);
  if (weightDiff != null && Math.abs(weightDiff) > 0.05) {
    const down = weightDiff < 0;
    if ((down && !wantsWeightGain) || (!down && wantsWeightGain)) {
      changes.push({ label: "Weight", deltaText: `${down ? "↓" : "↑"} ${Math.abs(weightDiff).toFixed(1)} ${unit}`, direction: down ? "down" : "up" });
    }
  }

  if (latest.bodyFatPercent != null && previous.bodyFatPercent != null) {
    const diff = latest.bodyFatPercent - previous.bodyFatPercent;
    if (diff < -0.05) changes.push({ label: "Body Fat", deltaText: `↓ ${Math.abs(diff).toFixed(1)}%`, direction: "down" });
  }

  if (latest.visceralFat != null && previous.visceralFat != null) {
    const diff = latest.visceralFat - previous.visceralFat;
    if (diff < -0.4) changes.push({ label: "Visceral Fat", deltaText: `↓ ${Math.abs(diff).toFixed(0)}`, direction: "down" });
  }

  const muscleDiff = weightLike(latest.muscleMassKg, previous.muscleMassKg);
  if (muscleDiff != null && muscleDiff > 0.05) {
    changes.push({ label: "Muscle Mass", deltaText: `↑ ${muscleDiff.toFixed(1)} ${unit}`, direction: "up" });
  }

  const skeletalDiff = weightLike(latest.skeletalMuscleKg, previous.skeletalMuscleKg);
  if (skeletalDiff != null && skeletalDiff > 0.05) {
    changes.push({ label: "Skeletal Muscle", deltaText: `↑ ${skeletalDiff.toFixed(1)} ${unit}`, direction: "up" });
  }

  if (latest.bodyWaterPercent != null && previous.bodyWaterPercent != null) {
    const diff = latest.bodyWaterPercent - previous.bodyWaterPercent;
    if (diff > 0.3) changes.push({ label: "Body Water", deltaText: `↑ ${diff.toFixed(1)}%`, direction: "up" });
  }

  return changes;
}

const MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "chestCm", label: "Bust" },
  { key: "waistCm", label: "Waist" },
  { key: "lowerAbdomenCm", label: "Abdomen" },
  { key: "hipsCm", label: "Hips" },
  { key: "neckCm", label: "Neck" },
  { key: "shoulderCm", label: "Shoulder" },
  { key: "rightArmCm", label: "Right Arm" },
  { key: "leftArmCm", label: "Left Arm" },
  { key: "rightThighCm", label: "Right Thigh" },
  { key: "leftThighCm", label: "Left Thigh" },
];

/**
 * Real positive-progress detection for Measurements — a decrease is
 * this business's default contouring goal, so it's treated as
 * positive unless the client's own goal text says otherwise (e.g.
 * explicitly wants more volume in an area, which this system doesn't
 * currently model per-zone — a reasonable simplification for now).
 */
export function getPositiveMeasurementChanges(
  latest: Record<string, unknown>,
  previous: Record<string, unknown> | null | undefined,
  unit: "cm" | "in"
): MetricChange[] {
  if (!previous) return [];
  const changes: MetricChange[] = [];
  for (const f of MEASUREMENT_FIELDS) {
    const curr = latest[f.key] as number | null | undefined;
    const prev = previous[f.key] as number | null | undefined;
    if (curr == null || prev == null) continue;
    const diffCm = curr - prev;
    if (diffCm < -0.2) {
      const diffDisplay = unit === "cm" ? diffCm : cmToIn(diffCm);
      changes.push({ label: f.label, deltaText: `↓ ${Math.abs(diffDisplay).toFixed(1)} ${unit}`, direction: "down" });
    }
  }
  return changes;
}

export function getCompositionClosingPhrase(changes: MetricChange[]): string {
  const labels = new Set(changes.map((c) => c.label));
  if (labels.has("Weight") && labels.has("Body Water") && labels.has("Muscle Mass")) {
    return "Less weight. Better hydration. Stronger composition.";
  }
  if (labels.has("Weight") && labels.has("Body Water")) {
    return "Less weight. Better hydration.\nBeautiful progress.";
  }
  if (labels.has("Muscle Mass") || labels.has("Skeletal Muscle")) {
    return "Stronger composition.\nBeautiful progress.";
  }
  if (labels.has("Body Fat") || labels.has("Visceral Fat")) {
    return "Your composition is moving in the right direction.\nBeautiful progress.";
  }
  return "Your progress is showing.";
}

export const MEASUREMENTS_CLOSING_PHRASE = "Less volume. More definition.\nBeautiful progress.";
