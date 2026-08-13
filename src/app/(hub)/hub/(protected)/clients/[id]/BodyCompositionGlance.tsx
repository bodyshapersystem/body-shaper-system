"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatWeight, type WeightUnit } from "@/lib/units";

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
  // moved the wrong way, green if it moved the right way. improvements
  // collects plain-language wins for the congrats line below.
  const improvements: string[] = [];
  function trend(key: keyof RenphoFields, label: string, lowerIsBetter: boolean): "up" | "down" | null {
    const curr = latestRenpho![key];
    const prev = previousRenpho?.[key];
    if (curr == null || prev == null) return null;
    if (curr === prev) return null;
    const wentDown = curr < prev;
    const improved = lowerIsBetter ? wentDown : !wentDown;
    if (improved) improvements.push(label);
    return wentDown ? "down" : "up";
  }
  const weightTrend = trend("weightKg", "weight", true);
  const bmiTrend = trend("bmi", "BMI", true);
  const bodyFatTrend = trend("bodyFatPercent", "body fat %", true);
  const visceralTrend = trend("visceralFat", "visceral fat", true);
  const muscleTrend = trend("muscleMassKg", "muscle mass", false);

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
      {improvements.length > 0 && (
        <p style={{ color: "#4a7a4a", fontSize: 12.5, marginBottom: 10, fontFamily: "var(--sans)" }}>
          🎉 Congratulations — {improvements.join(", ")} improved since the last scan.
        </p>
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
