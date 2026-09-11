import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmry7ihpb0007l204syoij8dl";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { startsAt: "asc" },
      select: { id: true, title: true, startsAt: true, status: true, technologies: true },
    });

    const measurements = await prisma.measurement.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { scanDate: "asc" },
      select: { id: true, scanDate: true, sessionNumber: true, weightKg: true },
    });

    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
      select: { id: true, recommendedSystem: true, status: true },
    });

    return NextResponse.json({ success: true, appointments, measurements, assessment });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
