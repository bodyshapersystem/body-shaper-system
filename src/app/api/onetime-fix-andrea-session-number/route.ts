import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export async function GET() {
  try {
    // Cancelled sessions don't consume a real sequence slot — only
    // completed ones do. Sep 8 was mislabeled "Session 6" (counting
    // the cancelled Aug 25 slot); it's really the 5th real completed
    // session.
    const renamedAppointment = await prisma.appointment.updateMany({
      where: { clientId: CLIENT_ID, title: "Session 6 — Sculpt Start™", startsAt: new Date("2026-09-08T15:00:00.000Z") },
      data: { title: "Session 5 — Sculpt Start™" },
    });

    const fixedMeasurement = await prisma.measurement.updateMany({
      where: { clientId: CLIENT_ID, scanDate: new Date("2026-09-08T18:00:00.000Z") },
      data: { sessionNumber: 5 },
    });

    return NextResponse.json({ success: true, renamedAppointmentCount: renamedAppointment.count, fixedMeasurementCount: fixedMeasurement.count });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
