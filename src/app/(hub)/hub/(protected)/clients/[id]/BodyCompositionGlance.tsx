"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatWeight, kgToLb, type WeightUnit } from "@/lib/units";

type RenphoFields = {
  weightKg: number | null;
  bmi: number | null;
  bodyFatPercent: number | null;
  visceralFat: number | null;
  muscleMassKg: number | null;
  boneMassKg: number | null;
  bmr: number | null;
  bodyAge: number | null;
};
type LatestRenpho = RenphoFields | null;

export default function BodyCompositionGlance({ latestRenpho, previousRenpho }: { latestRenpho: LatestRenpho; previousRenpho?: LatestRenpho }) {
  const [unit, setUnit] = useState<WeightUnit>("lb");

  if (!latestRenpho) return null;

  // Clinically-recognized "needs attention" thresholds — not arbitrary
  // styling. BMI >=25 (overweight/obese per WHO), body fat % >=32
  // (commonly used female "high" threshold; imperfect for male
  // clients since sex isn't reliably stored per-client here), and
  // visceral fat >=10 (standard bioimpedance-scale "high" cutoff,
  // matches what RENPHO itself flags as Alto in the PDF report).
  const bmiHigh = latestRenpho.bmi != null && latestRenpho.bmi >= 25;
  const bodyFatHigh = latestRenpho.bodyFatPercent != null && latestRenpho.bodyFatPercent >= 32;
  const visceralHigh = latestRenpho.visceralFat != null && latestRenpho.visceralFat >= 10;

  // Change vs. the previous scan — lower is the goal for weight/fat/
  // visceral fat, higher is the goal for muscle mass. Wine red if it
  // moved the wrong way, green if it moved the right way. Each win
  // now carries its real quantified delta (e.g. "-2.3 lb"), not just
  // the field name — meant to be screenshot-worthy for the client to
  // post, not just an internal note.
  type Win = { label: string; deltaText: string };
  const wins: Win[] = [];

  function weightDelta(key: "weightKg" | "muscleMassKg", label: string, lowerIsBetter: boolean): "up" | "down" | null {
    const curr = latestRenpho![key];
    const prev = previousRenpho?.[key];
    if (curr == null || prev == null || curr === prev) return null;
    const wentDown = curr < prev;
    const improved = lowerIsBetter ? wentDown : !wentDown;
    if (improved) {
      const diffKg = Math.abs(curr - prev);
      const diffDisplay = unit === "kg" ? diffKg : kgToLb(diffKg);
      wins.push({ label, deltaText: `${wentDown ? "-" : "+"}${diffDisplay.toFixed(1)} ${unit}` });
    }
    return wentDown ? "down" : "up";
  }

  function percentDelta(key: "bmi" | "bodyFatPercent" | "visceralFat", label: string, decimals: number): "up" | "down" | null {
    const curr = latestRenpho![key];
    const prev = previousRenpho?.[key];
    if (curr == null || prev == null || curr === prev) return null;
    const wentDown = curr < prev; // lower is always better for these three
    if (wentDown) {
      const diff = Math.abs(curr - prev);
      const unitSuffix = key === "bodyFatPercent" ? "%" : "";
      wins.push({ label, deltaText: `-${diff.toFixed(decimals)}${unitSuffix}` });
    }
    return wentDown ? "down" : "up";
  }

  const weightTrend = weightDelta("weightKg", "Weight", true);
  const bmiTrend = percentDelta("bmi", "BMI", 1);
  const bodyFatTrend = percentDelta("bodyFatPercent", "Body Fat", 1);
  const visceralTrend = percentDelta("visceralFat", "Visceral Fat", 0);
  const muscleTrend = weightDelta("muscleMassKg", "Muscle Mass", false);

  function trendColor(t: "up" | "down" | null, lowerIsBetter: boolean): string | undefined {
    if (!t) return undefined;
    const improved = lowerIsBetter ? t === "down" : t === "up";
    return improved ? "#4a7a4a" : "#B24A52";
  }

  return (
    <>
      <div className="bbp-glance-header">
        <UnitToggle value={unit} options={["lb", "kg"]} onChange={setUnit} dark />
      </div>
      {wins.length > 0 && (
        <div className="bbp-progress-card">
          <p className="bbp-progress-card-title">🎉 Progress since last scan</p>
          <div className="bbp-progress-card-stats">
            {wins.map((w) => (
              <span key={w.label} className="bbp-progress-stat">
                <strong>{w.deltaText}</strong>
                <span>{w.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <ul className="bbp-glance-list">
        <li>
          <span>Weight</span>
          <strong style={{ color: trendColor(weightTrend, true) }}>{formatWeight(latestRenpho.weightKg, unit)}</strong>
        </li>
        <li>
          <span>BMI</span>
          <strong className={bmiHigh ? "bbp-glance-attention" : ""} style={!bmiHigh ? { color: trendColor(bmiTrend, true) } : undefined}>
            {latestRenpho.bmi?.toFixed(1) ?? "—"}
          </strong>
        </li>
        <li>
          <span>Body Fat %</span>
          <strong className={bodyFatHigh ? "bbp-glance-attention" : ""} style={!bodyFatHigh ? { color: trendColor(bodyFatTrend, true) } : undefined}>
            {latestRenpho.bodyFatPercent?.toFixed(1) ?? "—"}%
          </strong>
        </li>
        <li>
          <span>Visceral Fat</span>
          <strong className={visceralHigh ? "bbp-glance-attention" : ""} style={!visceralHigh ? { color: trendColor(visceralTrend, true) } : undefined}>
            {latestRenpho.visceralFat ?? "—"}
          </strong>
        </li>
        <li>
          <span>Muscle Mass</span>
          <strong style={{ color: trendColor(muscleTrend, false) }}>{formatWeight(latestRenpho.muscleMassKg, unit)}</strong>
        </li>
        <li>
          <span>Bone Mass</span>
          <strong>{formatWeight(latestRenpho.boneMassKg, unit)}</strong>
        </li>
        <li>
          <span>BMR</span>
          <strong>{latestRenpho.bmr ?? "—"} kcal</strong>
        </li>
        <li>
          <span>Metabolic Age</span>
          <strong>{latestRenpho.bodyAge ?? "—"}</strong>
        </li>
      </ul>
    </>
  );
}
