import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// One-time: adds Carolina "Caro" Cordero's RENPHO scan + tape measurements for today (Aug 21, 2026).
export async function GET() {
  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { AND: [{ firstName: { contains: "Carolina", mode: "insensitive" } }, { lastName: { contains: "Cordero", mode: "insensitive" } }] },
        { AND: [{ firstName: { contains: "Caro", mode: "insensitive" } }, { lastName: { contains: "Cordero", mode: "insensitive" } }] },
      ],
    },
    include: { blueprintAssessments: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!client) return NextResponse.json({ success: false, error: "Carolina Cordero not found" });

  const assessmentId = client.blueprintAssessments[0]?.id ?? null;
  const scanDate = new Date("2026-08-21T11:02:11");

  const measurement = await prisma.measurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      scanDate,
      weightKg: 67.95,
      bodyFatPercent: 22.1,
      muscleMassKg: 49.44,
      skeletalMuscleKg: 29.76,
      bodyWaterPercent: 57.14,
      proteinPercent: 15.62,
      bmi: 27.9,
      visceralFat: 5,
      subcutaneousFatPercent: 15.8,
      boneMassKg: 3.54,
      bmr: 1513,
      bodyAge: 33,
      fatFreeWeightKg: 52.89,
      notes: "Added from RENPHO report screenshot — big progress noted (body fat 33.6% -> 22.1%).",
    },
  });

  const bodyMeasurement = await prisma.bodyMeasurement.create({
    data: {
      clientId: client.id,
      assessmentId,
      measuredAt: scanDate,
      neckCm: 33.0,
      leftArmCm: 29.8,
      rightArmCm: 30.8,
      chestCm: 91.7,
      waistCm: 73.1,
      lowerAbdomenCm: 78.0,
      hipsCm: 111.3,
      leftThighCm: 58.2,
      rightThighCm: 58.9,
      notes: "Added from tape measurement app screenshot — today's session.",
    },
  });

  return NextResponse.json({ success: true, clientId: client.id, measurementId: measurement.id, bodyMeasurementId: bodyMeasurement.id });
}
