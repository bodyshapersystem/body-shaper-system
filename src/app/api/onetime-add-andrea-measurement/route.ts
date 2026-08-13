import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Andrea Trujillo's RENPHO scan + tape measurements
// (today, session 3) from her screenshots.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Andrea", mode: "insensitive" }, lastName: { equals: "Trujillo", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Andrea Trujillo not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-13T10:51:51");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 61.33,
      bodyFatPercent: 28.9,
      muscleMassKg: 40.73,
      skeletalMuscleKg: 24.04,
      bodyWaterPercent: 52.07,
      proteinPercent: 14.2,
      bmi: 23.1,
      visceralFat: 7,
      subcutaneousFatPercent: 20.6,
      boneMassKg: 2.9,
      bmr: 1311,
      bodyAge: 40,
      fatFreeWeightKg: 43.54,
      notes: "Added from RENPHO report screenshot — session 3.",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: scanDate,
      chestCm: 85.19,
      lowerAbdomenCm: 79.58,
      waistCm: 72.29,
      hipsCm: 100.18,
      notes: "Added from tape measurement app screenshot (converted from inches) — session 3.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
