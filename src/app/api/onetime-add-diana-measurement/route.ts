import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: creates a single Measurement record for Diana Escalante
// combining her RENPHO scan (Aug 10, 2026) and tape measurements from
// the same day. Scoped to her by name as a safety check.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Diana", mode: "insensitive" }, lastName: { equals: "Escalante", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });

  if (!client) {
    return NextResponse.json({ success: false, error: "Diana Escalante not found" });
  }

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate: new Date("2026-08-10T13:36:58"),
      // RENPHO body composition
      weightKg: 60.85,
      bodyFatPercent: 30.6,
      muscleMassKg: 39.43,
      skeletalMuscleKg: 23.18,
      bodyWaterPercent: (30.97 / 60.85) * 100,
      proteinPercent: (8.46 / 60.85) * 100,
      bmi: 22.9,
      visceralFat: 7,
      subcutaneousFatPercent: 21.8,
      boneMassKg: 2.80,
      bmr: 1282,
      bodyAge: 26,
      fatFreeWeightKg: 42.23,
      // Tape measurements
      neckCm: 31.4,
      shoulderCm: 98.9,
      bicepsLeftCm: 26.7,
      bicepsRightCm: 28.1,
      chestCm: 85.2,
      waistCm: 72.2,
      abdomenCm: 82.7,
      hipCm: 100.9,
      thighLeftCm: 54.7,
      thighRightCm: 56.1,
      notes: "Added from RENPHO report + tape measurement app screenshots.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, assessmentId, measurementId: measurement.id });
}
