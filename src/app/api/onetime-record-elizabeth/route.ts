import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmt5vrhsu000fic04ubv2rnmn";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const scanDate = new Date("2026-08-24T14:54:31.000Z");

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate,
        weightKg: 89.75,
        bmi: 31.8,
        bodyFatPercent: 43.4,
        boneMassKg: 3.40,
        proteinPercent: 11.3,
        bodyWaterPercent: 41.5,
        muscleMassKg: 47.48,
        skeletalMuscleKg: 28.45,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Body fat/protein/water were given in the source report as mass (kg); converted to percentages using the reported weight (38.95/89.75=43.4% fat, 10.14/89.75=11.3% protein, 37.25/89.75=41.5% water) — the 43.4% fat figure is cross-checked against the report's own separately-listed 43.4 figure.",
      },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        measuredAt: scanDate,
        waistCm: 89.4,
        lowerAbdomenCm: 100.9,
        rightThighCm: 73.8,
        leftThighCm: 73.9,
      },
    });

    return NextResponse.json({ success: true, measurement, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
