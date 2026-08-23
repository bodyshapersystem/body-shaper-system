"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatLength, cmToIn, type LengthUnit } from "@/lib/units";
import type { MetricChange } from "@/lib/progress-celebration";
import ProgressCelebrationOverlay from "@/app/(portal)/portal/(protected)/blueprint/ProgressCelebrationOverlay";
import { markMeasurementCelebrationSeen } from "@/app/(portal)/portal/(protected)/blueprint/celebration-actions";

type LatestBodyMeasurement = {
  chestCm: number | null;
  waistCm: number | null;
  lowerAbdomenCm: number | null;
  hipsCm: number | null;
  rightThighCm: number | null;
  leftThighCm: number | null;
  rightArmCm: number | null;
  leftArmCm: number | null;
} | null;

const FIELDS: { key: keyof NonNullable<LatestBodyMeasurement>; label: string }[] = [
  { key: "chestCm", label: "Bust" },
  { key: "waistCm", label: "Waist" },
  { key: "lowerAbdomenCm", label: "Abdomen" },
  { key: "hipsCm", label: "Hips" },
  { key: "rightThighCm", label: "Right Thigh" },
  { key: "leftThighCm", label: "Left Thigh" },
  { key: "rightArmCm", label: "Right Arm" },
  { key: "leftArmCm", label: "Left Arm" },
];

export default function MeasurementsGlance({
  latestBodyMeasurement,
  previousBodyMeasurement,
  bodyMeasurementId,
  celebration,
  persistentShareUrl,
}: {
  latestBodyMeasurement: LatestBodyMeasurement;
  previousBodyMeasurement?: LatestBodyMeasurement;
  bodyMeasurementId?: string;
  celebration?: { changes: MetricChange[]; closingPhrase: string; compareLabel: string; shareImageUrl: string } | null;
  persistentShareUrl?: string | null;
}) {
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [showCelebration, setShowCelebration] = useState(!!celebration);

  if (!latestBodyMeasurement) return null;

  function dismissCelebration() {
    setShowCelebration(false);
    if (bodyMeasurementId) markMeasurementCelebrationSeen(bodyMeasurementId).catch(() => undefined);
  }

  async function handlePersistentShare(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "body-shaper-system-progress.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Progress — Body Shaper System" });
      } else {
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = "body-shaper-system-progress.png";
        a.click();
        URL.revokeObjectURL(objUrl);
      }
    } catch {
      // Share sheet cancelled or unsupported.
    }
  }

  // Neutral "Progress Since Last Measurement" — real deltas (any
  // direction), no color judgment. Matches the same architecture as
  // Body Composition: static tracking here, celebration lives in the
  // separate Congratulations overlay below.
  type Row = { label: string; deltaText: string; arrow: "up" | "down" | "flat" };
  const rows: Row[] = [];
  for (const { key, label } of FIELDS) {
    const curr = latestBodyMeasurement[key];
    const prev = previousBodyMeasurement?.[key];
    if (curr == null || prev == null) continue;
    const diffCm = curr - prev;
    if (Math.abs(diffCm) < 0.05) {
      rows.push({ label, deltaText: "→ stable", arrow: "flat" });
      continue;
    }
    const diffDisplay = unit === "cm" ? diffCm : cmToIn(diffCm);
    const arrow = diffCm > 0 ? "up" : "down";
    rows.push({ label, deltaText: `${arrow === "up" ? "↑" : "↓"} ${Math.abs(diffDisplay).toFixed(1)} ${unit}`, arrow });
  }

  return (
    <>
      <div className="bbp-glance-header">
        <UnitToggle value={unit} options={["cm", "in"]} onChange={setUnit} dark />
      </div>

      <ul className="bbp-glance-list">
        {FIELDS.map(({ key, label }) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{formatLength(latestBodyMeasurement[key], unit)}</strong>
          </li>
        ))}
      </ul>

      {rows.length > 0 && (
        <div className="bbp-progress-neutral-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <p className="bbp-progress-card-title" style={{ fontStyle: "normal", marginBottom: 0 }}>Progress Since Last Measurement</p>
            {persistentShareUrl && (
              <button type="button" className="bbp-persistent-share-btn" onClick={() => handlePersistentShare(persistentShareUrl)}>
                SHARE MY PROGRESS ↗
              </button>
            )}
          </div>
          <div className="bbp-progress-neutral-stats" style={{ marginTop: 10 }}>
            {rows.map((r) => (
              <span key={r.label} className={`bbp-progress-neutral-stat bbp-arrow-${r.arrow}`}>
                <strong>{r.deltaText}</strong>
                <span>{r.label.toUpperCase()}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {showCelebration && celebration && (
        <ProgressCelebrationOverlay
          category="MEASUREMENTS"
          changes={celebration.changes}
          closingPhrase={celebration.closingPhrase}
          compareLabel={celebration.compareLabel}
          shareImageUrl={celebration.shareImageUrl}
          onDismiss={dismissCelebration}
        />
      )}
    </>
  );
}
