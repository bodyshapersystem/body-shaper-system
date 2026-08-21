"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatLength, cmToIn, type LengthUnit } from "@/lib/units";

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
}: {
  latestBodyMeasurement: LatestBodyMeasurement;
  previousBodyMeasurement?: LatestBodyMeasurement;
}) {
  const [unit, setUnit] = useState<LengthUnit>("cm");

  if (!latestBodyMeasurement) return null;

  // Every circumference here — smaller is the goal, always (this is a
  // body contouring business; treated consistently as "smaller =
  // improved" for this glance view). Each win carries its real
  // quantified delta (e.g. "-2.0 cm"), meant to be screenshot-worthy
  // for the client to post, not just an internal note.
  type Win = { label: string; deltaText: string };
  const wins: Win[] = [];
  const trends = new Map<string, "up" | "down">();
  for (const { key, label } of FIELDS) {
    const curr = latestBodyMeasurement[key];
    const prev = previousBodyMeasurement?.[key];
    if (curr == null || prev == null || curr === prev) continue;
    const wentDown = curr < prev;
    trends.set(key, wentDown ? "down" : "up");
    if (wentDown) {
      const diffCm = Math.abs(curr - prev);
      const diffDisplay = unit === "cm" ? diffCm : cmToIn(diffCm);
      wins.push({ label, deltaText: `-${diffDisplay.toFixed(1)} ${unit}` });
    }
  }

  function trendColor(key: string): string | undefined {
    const t = trends.get(key);
    if (!t) return undefined;
    return t === "down" ? "#4a7a4a" : "#B24A52";
  }

  return (
    <>
      <div className="bbp-glance-header">
        <UnitToggle value={unit} options={["cm", "in"]} onChange={setUnit} dark />
      </div>
      {wins.length > 0 && (
        <div className="bbp-progress-card">
          <p className="bbp-progress-card-title">🎉 Progress since last measurement</p>
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
        {FIELDS.map(({ key, label }) => (
          <li key={key}>
            <span>{label}</span>
            <strong style={{ color: trendColor(key) }}>{formatLength(latestBodyMeasurement[key], unit)}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}
