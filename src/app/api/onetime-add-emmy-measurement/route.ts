import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Emmy Branger's own RENPHO scan + tape measurements
// (from her screenshots) to her test/owner client account, dated
// yesterday (Aug 10, 2026 — "today" is Aug 11).
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Emmy", mode: "insensitive" }, lastName: { equals: "Branger", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Emmy's client record not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-10T15:28:23");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 81.65,
      bodyFatPercent: 41.7,
      muscleMassKg: 44.42,
      skeletalMuscleKg: 26.54,
      bodyWaterPercent: (34.95 / 81.65) * 100,
      proteinPercent: (9.55 / 81.65) * 100,
      bmi: 26.7,
      visceralFat: 15,
      subcutaneousFatPercent: 29.7,
      boneMassKg: 3.20,
      bmr: 1399,
      bodyAge: 39,
      fatFreeWeightKg: 47.60,
      notes: "Added from RENPHO report screenshot (test/owner account).",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: new Date("2026-08-10T15:33:00"),
      neckCm: 12.67 * 2.54,
      shoulderCm: 40.86 * 2.54,
      leftArmCm: 12.59 * 2.54,
      rightArmCm: 12.59 * 2.54,
      chestCm: 38.42 * 2.54,
      waistCm: 32.24 * 2.54,
      lowerAbdomenCm: 33.97 * 2.54,
      hipsCm: 47.95 * 2.54,
      leftThighCm: 27.20 * 2.54,
      rightThighCm: 28.11 * 2.54,
      notes: "Added from tape measurement app screenshot (test/owner account, converted from inches).",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
