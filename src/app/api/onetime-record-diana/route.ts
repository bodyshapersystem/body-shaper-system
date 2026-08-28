import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrkyxmmp0007jv043rs701wz";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate: new Date(),
        weightKg: 59.70,
        bodyFatPercent: 28.4,
        proteinPercent: 14.3,
        bodyWaterPercent: 52.6,
        muscleMassKg: 39.94,
        skeletalMuscleKg: 23.52,
        boneMassKg: 2.90,
        deviceSource: "RENPHO Health",
        notes: "Imported from RENPHO report. Body fat/protein/water were given in the source report as mass (kg); converted to percentages using the reported weight (16.95/59.70=28.4% fat, 8.54/59.70=14.3% protein, 31.40/59.70=52.6% water).",
      },
    });

    return NextResponse.json({ success: true, measurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
