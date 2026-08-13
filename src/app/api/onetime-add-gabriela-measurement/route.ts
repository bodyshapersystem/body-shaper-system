import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Gabriela Escalona's RENPHO scan + tape measurements for today.
export async function GET() {
  const client = await prisma.client.findFirst({
    where: { firstName: { equals: "Gabriela", mode: "insensitive" }, lastName: { equals: "Escalona", mode: "insensitive" } },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Gabriela Escalona not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-13T16:46:59");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 52.53,
      bodyFatPercent: 41.5,
      muscleMassKg: 28.67,
      skeletalMuscleKg: 16.15,
      bodyWaterPercent: 42.83,
      proteinPercent: 11.74,
      bmi: 22.7,
      visceralFat: 9,
      subcutaneousFatPercent: 29.5,
      boneMassKg: 2.09,
      bmr: 1033,
      bodyAge: 26,
      fatFreeWeightKg: 30.75,
      notes: "Added from RENPHO report screenshot — today's session.",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: scanDate,
      waistCm: 66.2,
      lowerAbdomenCm: 85.6,
      hipsCm: 99.3,
      notes: "Added from tape measurement app screenshot — today's session.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
