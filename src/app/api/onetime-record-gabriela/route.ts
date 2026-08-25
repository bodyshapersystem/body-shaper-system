import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const scanDate = new Date("2026-08-25T18:00:00.000Z");

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate,
        bmi: 21.21,
        boneMassKg: 2.60,
        muscleMassKg: 36.34,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Weight and body fat/protein/water figures from the source report were not entered: weight appeared inconsistent with the reported BMI + height, and the fat/protein/water values were given as mass (kg) while this system stores those three as percentages — please confirm the real weight and % figures to add them.",
      },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        measuredAt: scanDate,
        waistCm: 68.5,
        lowerAbdomenCm: 74.3,
      },
    });

    return NextResponse.json({ success: true, measurement, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
