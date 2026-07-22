import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ANDREA_CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";
const ASSESSMENT_ID = "cmrr0c5910002i6041roqfofe";

// lb -> kg
const LB = 0.45359237;

export default async function EmergencyAndreaRenphoScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const existing = await prisma.measurement.findFirst({
    where: { clientId: ANDREA_CLIENT_ID, scanDate: new Date("2026-07-21") },
  });
  if (existing) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>A scan for 2026-07-21 already exists (id: {existing.id}) — nothing changed.</div>;
  }

  // Source: RENPHO body composition report, ID P26072103, jul 21 2026 11:56:49am
  // Original values in lb, converted to kg where the schema expects kg;
  // % fields computed from the mass values where the report only gave mass.
  const weightLb = 137.4;
  const owner = await prisma.user.findFirst({ where: { email: "hello@bodyshapersystem.com" } });

  const measurement = await prisma.measurement.create({
    data: {
      clientId: ANDREA_CLIENT_ID,
      assessmentId: ASSESSMENT_ID,
      scanDate: new Date("2026-07-21"),
      weightKg: Math.round(weightLb * LB * 10) / 10, // 62.3
      bmi: 23.5,
      bodyFatPercent: 22.4,
      visceralFat: 5,
      muscleMassKg: Math.round(99.6 * LB * 10) / 10, // 45.2
      skeletalMuscleKg: Math.round(59.4 * LB * 10) / 10, // 26.9
      bodyWaterPercent: Math.round((78.0 / weightLb) * 1000) / 10, // 56.8
      proteinPercent: Math.round((21.2 / weightLb) * 1000) / 10, // 15.4
      boneMassKg: Math.round(7.0 * LB * 10) / 10, // 3.2
      bmr: 1414,
      bodyAge: 38,
      fatFreeWeightKg: Math.round(106.6 * LB * 10) / 10, // 48.4
      subcutaneousFatPercent: 16.0,
      notes:
        "RENPHO scan (ID P26072103), Jul 21 2026. Body score 83/100. Optimal weight 125.8 lb. WHR 0.85. SMI 7.9 kg/m². Imported from PDF report — weight/mass fields converted lb→kg; body water % and protein % computed from reported mass ÷ weight (report gave mass in lb, not %).",
      createdById: owner?.id ?? null,
    },
  });

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      Created measurement {measurement.id} for Andrea, scan date 2026-07-21.
      {"\n\n"}
      weightKg: {measurement.weightKg}, bmi: {measurement.bmi}, bodyFatPercent: {measurement.bodyFatPercent}, visceralFat:{" "}
      {measurement.visceralFat}
      {"\n"}
      muscleMassKg: {measurement.muscleMassKg}, skeletalMuscleKg: {measurement.skeletalMuscleKg}
      {"\n"}
      bodyWaterPercent: {measurement.bodyWaterPercent}, proteinPercent: {measurement.proteinPercent}, boneMassKg: {measurement.boneMassKg}
      {"\n"}
      bmr: {measurement.bmr}, bodyAge: {measurement.bodyAge}, fatFreeWeightKg: {measurement.fatFreeWeightKg}, subcutaneousFatPercent:{" "}
      {measurement.subcutaneousFatPercent}
    </div>
  );
}
