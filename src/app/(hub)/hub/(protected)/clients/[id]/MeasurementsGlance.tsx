"use client";

import { useState } from "react";
import UnitToggle from "@/components/UnitToggle";
import { formatLength, type LengthUnit } from "@/lib/units";

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

export default function MeasurementsGlance({ latestBodyMeasurement }: { latestBodyMeasurement: LatestBodyMeasurement }) {
  const [unit, setUnit] = useState<LengthUnit>("cm");

  if (!latestBodyMeasurement) return null;

  return (
    <>
      <div className="bbp-glance-header">
        <UnitToggle value={unit} options={["cm", "in"]} onChange={setUnit} dark />
      </div>
      <ul className="bbp-glance-list">
        <li>
          <span>Bust</span>
          <strong>{formatLength(latestBodyMeasurement.chestCm, unit)}</strong>
        </li>
        <li>
          <span>Waist</span>
          <strong>{formatLength(latestBodyMeasurement.waistCm, unit)}</strong>
        </li>
        <li>
          <span>Abdomen</span>
          <strong>{formatLength(latestBodyMeasurement.lowerAbdomenCm, unit)}</strong>
        </li>
        <li>
          <span>Hips</span>
          <strong>{formatLength(latestBodyMeasurement.hipsCm, unit)}</strong>
        </li>
        <li>
          <span>Right Thigh</span>
          <strong>{formatLength(latestBodyMeasurement.rightThighCm, unit)}</strong>
        </li>
        <li>
          <span>Left Thigh</span>
          <strong>{formatLength(latestBodyMeasurement.leftThighCm, unit)}</strong>
        </li>
        <li>
          <span>Right Arm</span>
          <strong>{formatLength(latestBodyMeasurement.rightArmCm, unit)}</strong>
        </li>
        <li>
          <span>Left Arm</span>
          <strong>{formatLength(latestBodyMeasurement.leftArmCm, unit)}</strong>
        </li>
      </ul>
    </>
  );
}
