import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Carolina "Caro" Cordero's RENPHO scan + tape
// measurements (from her screenshots, today) as one measurement +
// one body-measurement record. Scoped by name as a safety check.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Carolina", mode: "insensitive" }, lastName: { equals: "Cordero", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Carolina Cordero not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-10T14:48:06");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 69.60,
      bodyFatPercent: 33.6,
      muscleMassKg: 43.08,
      skeletalMuscleKg: 25.61,
      bodyWaterPercent: (33.90 / 69.60) * 100,
      proteinPercent: (9.26 / 69.60) * 100,
      bmi: 28.6,
      visceralFat: 9,
      subcutaneousFatPercent: 24.0,
      boneMassKg: 3.10,
      bmr: 1367,
      bodyAge: 37,
      fatFreeWeightKg: 46.21,
      notes: "Added from RENPHO report screenshot.",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: new Date("2026-08-10T14:46:00"),
      neckCm: 13.18 * 2.54,
      shoulderCm: 41.88 * 2.54,
      leftArmCm: 13.07 * 2.54,
      rightArmCm: 12.59 * 2.54,
      chestCm: 38.66 * 2.54,
      waistCm: 29.37 * 2.54,
      lowerAbdomenCm: 32.99 * 2.54,
      hipsCm: 43.74 * 2.54,
      leftThighCm: 24.80 * 2.54,
      rightThighCm: 25.23 * 2.54,
      notes: "Added from tape measurement app screenshot (converted from inches).",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
