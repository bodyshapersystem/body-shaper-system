import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmry7ihpb0007l204syoij8dl";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const scanDate = new Date("2026-08-31T00:00:00.000Z");

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate,
        weightKg: 60.05,
        bodyFatPercent: 36.5,
        proteinPercent: 12.7,
        bodyWaterPercent: 46.6,
        muscleMassKg: 35.61,
        skeletalMuscleKg: 20.72,
        boneMassKg: 2.60,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Body fat/protein/water given as mass (kg); converted to percentages using the reported weight (21.92/60.05=36.5% fat, 7.63/60.05=12.7% protein, 27.98/60.05=46.6% water).",
      },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        measuredAt: scanDate,
        waistCm: 72.6,
        lowerAbdomenCm: 76.3,
        hipsCm: 104.8,
        leftThighCm: 56.4,
        rightThighCm: 56.1,
      },
    });

    return NextResponse.json({ success: true, measurement, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
