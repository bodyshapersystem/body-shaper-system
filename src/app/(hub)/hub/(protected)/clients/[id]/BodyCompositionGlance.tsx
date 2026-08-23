"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatWeight, kgToLb, type WeightUnit } from "@/lib/units";
import type { MetricChange } from "@/lib/progress-celebration";
import ProgressCelebrationOverlay from "@/app/(portal)/portal/(protected)/blueprint/ProgressCelebrationOverlay";
import { markCompositionCelebrationSeen } from "@/app/(portal)/portal/(protected)/blueprint/celebration-actions";

type RenphoFields = {
  weightKg: number | null;
  bmi: number | null;
  bodyFatPercent: number | null;
  visceralFat: number | null;
  muscleMassKg: number | null;
  skeletalMuscleKg: number | null;
  bodyWaterPercent: number | null;
  proteinPercent: number | null;
  boneMassKg: number | null;
  subcutaneousFatPercent: number | null;
  bmr: number | null;
  bodyAge: number | null;
  whr: number | null;
  smi: number | null;
};
type LatestRenpho = RenphoFields | null;

type Delta = { arrow: "up" | "down" | "flat"; text: string };

function computeDelta(curr: number | null, prev: number | null | undefined, decimals: number, unitSuffix: string): Delta | null {
  if (curr == null || prev == null) return null;
  const diff = curr - prev;
  if (Math.abs(diff) < Math.pow(10, -decimals) / 2) return { arrow: "flat", text: `→ stable` };
  const arrow = diff > 0 ? "up" : "down";
  return { arrow, text: `${arrow === "up" ? "↑" : "↓"} ${Math.abs(diff).toFixed(decimals)}${unitSuffix}` };
}

/**
 * Body Blueprint™ — "your body at a glance." Directional arrows here
 * are neutral by design: an increase isn't automatically shown as
 * good, a decrease isn't automatically shown as bad. What a change
 * means depends on the client's actual goals — that's what the
 * "What Changed?" interpretation below is for, not color-coding.
 */
export default function BodyCompositionGlance({
  latestRenpho,
  previousRenpho,
  measurementId,
  celebration,
  persistentShareUrl,
}: {
  latestRenpho: LatestRenpho;
  previousRenpho?: LatestRenpho;
  measurementId?: string;
  celebration?: { changes: MetricChange[]; closingPhrase: string; compareLabel: string; shareImageUrl: string } | null;
  persistentShareUrl?: string | null;
}) {
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(!!celebration);

  function dismissCelebration() {
    setShowCelebration(false);
    if (measurementId) markCompositionCelebrationSeen(measurementId).catch(() => undefined);
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

  if (!latestRenpho) return null;

  // Clinically-recognized "needs attention" thresholds — absolute
  // value flags, not trend judgments. BMI >=25 (WHO overweight/
  // obese), body fat % >=32 (commonly used female "high" threshold),
  // visceral fat >=10 (standard bioimpedance "high" cutoff).
  const bodyFatHigh = latestRenpho.bodyFatPercent != null && latestRenpho.bodyFatPercent >= 32;
  const visceralHigh = latestRenpho.visceralFat != null && latestRenpho.visceralFat >= 10;
  const bmiHigh = latestRenpho.bmi != null && latestRenpho.bmi >= 25;

  function weightDeltaDisplay(kgCurr: number | null, kgPrev: number | null | undefined): Delta | null {
    if (kgCurr == null || kgPrev == null) return null;
    const diffKg = kgCurr - kgPrev;
    const diffDisplay = unit === "kg" ? diffKg : kgToLb(diffKg);
    if (Math.abs(diffDisplay) < 0.05) return { arrow: "flat", text: "→ stable" };
    const arrow = diffDisplay > 0 ? "up" : "down";
    return { arrow, text: `${arrow === "up" ? "↑" : "↓"} ${Math.abs(diffDisplay).toFixed(1)} ${unit}` };
  }

  const weightDelta = weightDeltaDisplay(latestRenpho.weightKg, previousRenpho?.weightKg);
  const bodyFatDelta = computeDelta(latestRenpho.bodyFatPercent, previousRenpho?.bodyFatPercent, 1, "%");
  const muscleDelta = weightDeltaDisplay(latestRenpho.muscleMassKg, previousRenpho?.muscleMassKg);
  const skeletalDelta = weightDeltaDisplay(latestRenpho.skeletalMuscleKg, previousRenpho?.skeletalMuscleKg);
  const waterDelta = weightDeltaDisplay(
    latestRenpho.bodyWaterPercent != null && latestRenpho.weightKg != null ? (latestRenpho.bodyWaterPercent / 100) * latestRenpho.weightKg : null,
    previousRenpho?.bodyWaterPercent != null && previousRenpho?.weightKg != null ? (previousRenpho.bodyWaterPercent / 100) * previousRenpho.weightKg : null
  );
  const visceralDelta = computeDelta(latestRenpho.visceralFat, previousRenpho?.visceralFat, 0, "");

  const progressRows = [
    { label: "WEIGHT", delta: weightDelta },
    { label: "BODY FAT", delta: bodyFatDelta },
    { label: "MUSCLE MASS", delta: muscleDelta },
    { label: "SKELETAL MUSCLE", delta: skeletalDelta },
    { label: "BODY WATER", delta: waterDelta },
    { label: "VISCERAL FAT", delta: visceralDelta },
  ].filter((r) => r.delta !== null);

  // "What Changed?" — a plain-language read of the same three core
  // signals (weight, body fat, muscle), not a sales pitch. Before
  // midpoint this stays purely observational — no system/upgrade talk.
  function whatChanged(): string | null {
    if (!weightDelta || !bodyFatDelta || !muscleDelta) return null;
    const weightDown = weightDelta.arrow === "down";
    const fatDown = bodyFatDelta.arrow === "down";
    const muscleDown = muscleDelta.arrow === "down";
    const muscleFlat = muscleDelta.arrow === "flat";

    if (weightDown && fatDown && (muscleFlat || !muscleDown)) {
      return "Your composition is moving in the right direction.\n\nWeight and body fat are trending down while muscle mass remains stable.";
    }
    if (weightDown && muscleDown) {
      return "Your body composition is changing.\n\nWeight is trending down while muscle mass has also decreased slightly.\n\nWe'll continue watching this signal as you move toward your Midpoint Review.";
    }
    if (!weightDown && !fatDown && !muscleDown) {
      return "Your body composition is holding steady since your last scan.\n\nWe'll keep tracking these numbers as your System continues.";
    }
    return "Your body composition is shifting since your last scan.\n\nWe're tracking these changes together as your System continues.";
  }
  const whatChangedText = whatChanged();

  return (
    <>
      <div className="bbp-glance-header">
        <UnitToggle value={unit} options={["lb", "kg"]} onChange={setUnit} dark />
      </div>

      <ul className="bbp-glance-list">
        <li>
          <span>Weight</span>
          <strong>{formatWeight(latestRenpho.weightKg, unit)}</strong>
        </li>
        <li>
          <span>Body Fat %</span>
          <strong className={bodyFatHigh ? "bbp-glance-attention" : ""}>{latestRenpho.bodyFatPercent?.toFixed(1) ?? "—"}%</strong>
        </li>
        <li>
          <span>Muscle Mass</span>
          <strong>{formatWeight(latestRenpho.muscleMassKg, unit)}</strong>
        </li>
        <li>
          <span>Skeletal Muscle</span>
          <strong>{formatWeight(latestRenpho.skeletalMuscleKg, unit)}</strong>
        </li>
        <li>
          <span>Body Water</span>
          <strong>{latestRenpho.bodyWaterPercent?.toFixed(1) ?? "—"}%</strong>
        </li>
        <li>
          <span>Visceral Fat</span>
          <strong className={visceralHigh ? "bbp-glance-attention" : ""}>{latestRenpho.visceralFat ?? "—"}</strong>
        </li>
      </ul>

      {progressRows.length > 0 && (
        <div className="bbp-progress-neutral-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <p className="bbp-progress-card-title" style={{ fontStyle: "normal", marginBottom: 0 }}>Progress Since Last Scan</p>
            {persistentShareUrl && (
              <button type="button" className="bbp-persistent-share-btn" onClick={() => handlePersistentShare(persistentShareUrl)}>
                SHARE MY PROGRESS ↗
              </button>
            )}
          </div>
          <div className="bbp-progress-neutral-stats" style={{ marginTop: 10 }}>
            {progressRows.map((r) => (
              <span key={r.label} className={`bbp-progress-neutral-stat bbp-arrow-${r.delta!.arrow}`}>
                <strong>{r.delta!.text}</strong>
                <span>{r.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {whatChangedText && (
        <div className="bbp-what-changed-card">
          <p className="bbp-progress-card-title" style={{ fontStyle: "normal" }}>What Changed?</p>
          <p className="bbp-what-changed-text">{whatChangedText}</p>
        </div>
      )}

      <button type="button" className="bbp-details-toggle" onClick={() => setDetailsOpen((v) => !v)}>
        {detailsOpen ? "Hide full composition ↑" : "View full composition →"}
      </button>

      {detailsOpen && (
        <ul className="bbp-glance-list" style={{ marginTop: 10 }}>
          <li>
            <span>BMI</span>
            <strong className={bmiHigh ? "bbp-glance-attention" : ""}>{latestRenpho.bmi?.toFixed(1) ?? "—"}</strong>
          </li>
          <li>
            <span>Protein Mass</span>
            <strong>{latestRenpho.proteinPercent?.toFixed(1) ?? "—"}%</strong>
          </li>
          <li>
            <span>Bone Mass</span>
            <strong>{formatWeight(latestRenpho.boneMassKg, unit)}</strong>
          </li>
          <li>
            <span>Subcutaneous Fat</span>
            <strong>{latestRenpho.subcutaneousFatPercent?.toFixed(1) ?? "—"}%</strong>
          </li>
          <li>
            <span>BMR</span>
            <strong>{latestRenpho.bmr ?? "—"} kcal</strong>
          </li>
          <li>
            <span>Metabolic Age</span>
            <strong>{latestRenpho.bodyAge ?? "—"}</strong>
          </li>
          <li>
            <span>WHR</span>
            <strong>{latestRenpho.whr?.toFixed(2) ?? "—"}</strong>
          </li>
          <li>
            <span>SMI</span>
            <strong>{latestRenpho.smi?.toFixed(1) ?? "—"} kg/m²</strong>
          </li>
        </ul>
      )}

      {showCelebration && celebration && (
        <ProgressCelebrationOverlay
          category="BODY COMPOSITION"
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