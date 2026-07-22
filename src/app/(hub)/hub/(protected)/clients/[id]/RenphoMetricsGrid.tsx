"use client";

import { useState } from "react";

const KG_TO_LB = 2.2046226;

type RenphoLike = {
  weightKg: number | null;
  bmi: number | null;
  bodyFatPercent: number | null;
  visceralFat: number | null;
  muscleMassKg: number | null;
  skeletalMuscleKg: number | null;
  bodyWaterPercent: number | null;
  proteinPercent: number | null;
  boneMassKg: number | null;
  bmr: number | null;
  bodyAge: number | null;
};

function fmt(n: number | null, decimals = 1): string {
  if (n == null) return "—";
  return n.toFixed(decimals);
}

/**
 * Renders the RENPHO scan tiles with a lb/kg toggle for the client-
 * facing (and owner) Body Blueprint view. Only the mass fields
 * (Weight, Muscle Mass, Skeletal Muscle, Bone Mass) convert — %, BMI,
 * kcal, and age fields are unit-agnostic and stay as-is regardless of
 * the toggle.
 */
export default function RenphoMetricsGrid({ latestRenpho }: { latestRenpho: RenphoLike }) {
  const [unit, setUnit] = useState<"kg" | "lb">("lb");

  const weight = unit === "kg" ? latestRenpho.weightKg : latestRenpho.weightKg != null ? latestRenpho.weightKg * KG_TO_LB : null;
  const muscle =
    unit === "kg" ? latestRenpho.muscleMassKg : latestRenpho.muscleMassKg != null ? latestRenpho.muscleMassKg * KG_TO_LB : null;
  const skeletal =
    unit === "kg"
      ? latestRenpho.skeletalMuscleKg
      : latestRenpho.skeletalMuscleKg != null
      ? latestRenpho.skeletalMuscleKg * KG_TO_LB
      : null;
  const bone = unit === "kg" ? latestRenpho.boneMassKg : latestRenpho.boneMassKg != null ? latestRenpho.boneMassKg * KG_TO_LB : null;

  const tiles = [
    { label: "Weight", value: fmt(weight), unit },
    { label: "BMI", value: fmt(latestRenpho.bmi), unit: "" },
    { label: "Body Fat %", value: fmt(latestRenpho.bodyFatPercent), unit: "%" },
    { label: "Visceral Fat", value: fmt(latestRenpho.visceralFat, 0), unit: "" },
    { label: "Muscle Mass", value: fmt(muscle), unit },
    { label: "Skeletal Muscle", value: fmt(skeletal), unit },
    { label: "Body Water", value: fmt(latestRenpho.bodyWaterPercent), unit: "%" },
    { label: "Protein", value: fmt(latestRenpho.proteinPercent), unit: "%" },
    { label: "Bone Mass", value: fmt(bone), unit },
    { label: "BMR", value: latestRenpho.bmr != null ? String(latestRenpho.bmr) : "—", unit: "kcal" },
    { label: "Metabolic Age", value: latestRenpho.bodyAge != null ? String(latestRenpho.bodyAge) : "—", unit: "" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <div className="unit-toggle" role="group" aria-label="Units">
          <button
            type="button"
            className={`unit-toggle-btn${unit === "lb" ? " unit-toggle-btn-active" : ""}`}
            onClick={() => setUnit("lb")}
          >
            lb
          </button>
          <button
            type="button"
            className={`unit-toggle-btn${unit === "kg" ? " unit-toggle-btn-active" : ""}`}
            onClick={() => setUnit("kg")}
          >
            kg
          </button>
        </div>
      </div>
      <div className="bbp-stat-tiles">
        {tiles.map((t) => (
          <div className="bbp-stat-tile" key={t.label}>
            <p className="bbp-stat-tile-label">{t.label}</p>
            <p className="bbp-stat-tile-value">
              {t.value}
              {t.value !== "—" && t.unit ? <span className="bbp-stat-tile-unit">{t.unit}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
