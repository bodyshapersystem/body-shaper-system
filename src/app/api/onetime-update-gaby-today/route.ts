import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const scanDate = new Date();

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate,
        weightKg: 52.75,
        bodyFatPercent: 23.6,
        proteinPercent: 15.3,
        bodyWaterPercent: 56.1,
        muscleMassKg: 37.66,
        skeletalMuscleKg: 22.05,
        boneMassKg: 2.70,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Body fat/protein/water given as mass (kg); converted to percentages using the reported weight (12.45/52.75=23.6% fat, 8.07/52.75=15.3% protein, 29.59/52.75=56.1% water).",
      },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        measuredAt: scanDate,
        waistCm: 68.5,
        lowerAbdomenCm: 76.1,
      },
    });

    return NextResponse.json({ success: true, measurement, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
