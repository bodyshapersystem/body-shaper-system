import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";
const ALEXA_CLIENT_ID = "cmsdqttxm0003jr04vjvawhzf";
const LB = 0.45359237;
const IN_TO_CM = 2.54;

export default async function EmergencyAlexaRenphoAndMeasurementsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const client = await prisma.client.findUnique({
    where: { id: ALEXA_CLIENT_ID },
    include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!client) return <div style={{ padding: 40, fontFamily: "monospace" }}>Client not found.</div>;
  const assessment = client.blueprintAssessments[0];
  if (!assessment) return <div style={{ padding: 40, fontFamily: "monospace" }}>No Blueprint Assessment found for this client.</div>;

  const owner = await prisma.user.findFirst({ where: { email: "hello@bodyshapersystem.com" } });

  const scanDate = new Date("2026-08-03T18:43:49-04:00");
  const existingScan = await prisma.measurement.findFirst({ where: { clientId: ALEXA_CLIENT_ID, scanDate } });

  const weightLb = 124.6;
  let measurement = existingScan;
  if (!existingScan) {
    measurement = await prisma.measurement.create({
      data: {
        clientId: ALEXA_CLIENT_ID,
        assessmentId: assessment.id,
        scanDate,
        weightKg: Math.round(weightLb * LB * 10) / 10, // 56.5
        bmi: 20.8,
        bodyFatPercent: 23.8,
        visceralFat: 5,
        muscleMassKg: Math.round(88.4 * LB * 10) / 10, // 40.1
        skeletalMuscleKg: Math.round(52.2 * LB * 10) / 10, // 23.7
        bodyWaterPercent: Math.round((69.6 / weightLb) * 1000) / 10, // 55.9
        proteinPercent: Math.round((19.0 / weightLb) * 1000) / 10, // 15.2
        boneMassKg: Math.round(6.4 * LB * 10) / 10, // 2.9
        bmr: 1298,
        bodyAge: 38,
        fatFreeWeightKg: Math.round(95.0 * LB * 10) / 10, // 43.1
        subcutaneousFatPercent: 17.0,
        notes:
          "RENPHO scan (ID P26080302), Aug 3 2026 6:43:49pm. Body score 77/100. Optimal weight 129.0 lb. WHR 0.85. SMI 6.6 kg/m². Imported from PDF report — weight/mass fields converted lb→kg; body water % and protein % computed from reported mass ÷ weight.",
        createdById: owner?.id ?? null,
      },
    });
  }

  const existingBodyMeasurement = await prisma.bodyMeasurement.findFirst({ where: { clientId: ALEXA_CLIENT_ID, measuredAt: scanDate } });
  let bodyMeasurement = existingBodyMeasurement;
  if (!existingBodyMeasurement) {
    const armCm = Math.round(10.2 * IN_TO_CM * 10) / 10; // 25.9
    bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: ALEXA_CLIENT_ID,
        assessmentId: assessment.id,
        measuredAt: scanDate,
        waistCm: 69,
        rightArmCm: armCm,
        leftArmCm: armCm,
        notes: "Arms given as 10.2 in (converted to cm); waist given directly in cm.",
        specialistId: owner?.id ?? undefined,
      },
    });
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      RENPHO scan {existingScan ? "(already existed)" : "created"}: {measurement?.id}
      {"\n"}
      weightKg: {measurement?.weightKg}, bmi: {measurement?.bmi}, bodyFatPercent: {measurement?.bodyFatPercent}
      {"\n"}
      muscleMassKg: {measurement?.muscleMassKg}, skeletalMuscleKg: {measurement?.skeletalMuscleKg}
      {"\n"}
      bodyWaterPercent: {measurement?.bodyWaterPercent}, proteinPercent: {measurement?.proteinPercent}, boneMassKg: {measurement?.boneMassKg}
      {"\n"}
      bmr: {measurement?.bmr}, bodyAge: {measurement?.bodyAge}, fatFreeWeightKg: {measurement?.fatFreeWeightKg}
      {"\n\n"}
      Body measurement {existingBodyMeasurement ? "(already existed)" : "created"}: {bodyMeasurement?.id}
      {"\n"}
      waistCm: {bodyMeasurement?.waistCm}, rightArmCm: {bodyMeasurement?.rightArmCm}, leftArmCm: {bodyMeasurement?.leftArmCm}
    </div>
  );
}
