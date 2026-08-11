// Shared unit-conversion helpers — metric is always the source of
// truth in the database (cm, kg); these only affect display.
export const CM_PER_IN = 2.54;
export const KG_PER_LB = 0.45359237;

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export type LengthUnit = "cm" | "in";
export type WeightUnit = "kg" | "lb";

export function formatLength(valueCm: number | null | undefined, unit: LengthUnit): string {
  if (valueCm == null) return "—";
  return unit === "cm" ? `${valueCm.toFixed(1)} cm` : `${cmToIn(valueCm).toFixed(1)} in`;
}

export function formatWeight(valueKg: number | null | undefined, unit: WeightUnit): string {
  if (valueKg == null) return "—";
  return unit === "kg" ? `${valueKg.toFixed(1)} kg` : `${kgToLb(valueKg).toFixed(1)} lbs`;
}
