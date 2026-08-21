import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Emmy Branger's RENPHO scan + tape measurements,
// dated yesterday (Aug 20, 2026) per her explicit instruction.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Emmy", mode: "insensitive" }, lastName: { equals: "Branger", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Emmy Branger not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-20T11:18:17");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 80.35,
      bodyFatPercent: 41.9,
      muscleMassKg: 43.55,
      skeletalMuscleKg: 25.87,
      bodyWaterPercent: 42.6,
      proteinPercent: 11.6,
      bmi: 26.2,
      visceralFat: 15,
      subcutaneousFatPercent: 29.8,
      boneMassKg: 3.10,
      bmr: 1377,
      bodyAge: 39,
      fatFreeWeightKg: 46.68,
      notes: "Added from RENPHO report screenshot — dated yesterday's session.",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: scanDate,
      neckCm: 31.3,
      shoulderCm: 98.88,
      leftArmCm: 26.70,
      rightArmCm: 30.5,
      chestCm: 85.19,
      waistCm: 76.17,
      lowerAbdomenCm: 80.90,
      hipsCm: 119.28,
      leftThighCm: 65.38,
      rightThighCm: 65.58,
      notes: "Added from tape measurement app screenshot — dated yesterday's session.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
