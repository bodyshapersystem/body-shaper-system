import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrkyxmmp0007jv043rs701wz";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const bodyMeasurement = await prisma.bodyMeasurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        measuredAt: new Date(),
        waistCm: 74.0,
        lowerAbdomenCm: 77.6,
        hipsCm: 97.6,
      },
    });

    return NextResponse.json({ success: true, bodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
