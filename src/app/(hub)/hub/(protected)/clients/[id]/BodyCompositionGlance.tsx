"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatWeight, type WeightUnit } from "@/lib/units";

type LatestRenpho = {
  weightKg: number | null;
  bmi: number | null;
  bodyFatPercent: number | null;
  visceralFat: number | null;
  muscleMassKg: number | null;
  boneMassKg: number | null;
  bmr: number | null;
  bodyAge: number | null;
} | null;

export default function BodyCompositionGlance({ latestRenpho }: { latestRenpho: LatestRenpho }) {
  const [unit, setUnit] = useState<WeightUnit>("lb");

  if (!latestRenpho) return null;

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
          <span>BMI</span>
          <strong>{latestRenpho.bmi?.toFixed(1) ?? "—"}</strong>
        </li>
        <li>
          <span>Body Fat %</span>
          <strong>{latestRenpho.bodyFatPercent?.toFixed(1) ?? "—"}%</strong>
        </li>
        <li>
          <span>Visceral Fat</span>
          <strong>{latestRenpho.visceralFat ?? "—"}</strong>
        </li>
        <li>
          <span>Muscle Mass</span>
          <strong>{formatWeight(latestRenpho.muscleMassKg, unit)}</strong>
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
