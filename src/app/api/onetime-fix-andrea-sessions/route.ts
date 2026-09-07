import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export async function GET() {
  try {
    // Create the real, previously-unrecorded Session 3 — Aug 5, 2026, 2:00pm,
    // per Emmy's Visibook record, linked to the existing body measurement
    // taken that same day.
    const newAppointment = await prisma.appointment.create({
      data: {
        clientId: CLIENT_ID,
        title: "Session 3 — Sculpt Start™",
        startsAt: new Date("2026-08-05T18:00:00.000Z"), // 2:00pm local (confirmed EDT, UTC-4)
        status: "COMPLETED",
        technologies: [{ name: "Exilis Elite™", minutes: 50 }],
        skipAutomatedEmails: true,
      },
    });

    // Link the existing Aug 5 body measurement to this session number.
    const updatedMeasurement = await prisma.bodyMeasurement.updateMany({
      where: { clientId: CLIENT_ID, measuredAt: new Date("2026-08-05T20:13:26.442Z") },
      data: { sessionNumber: 3 },
    });

    // Renumber the existing appointments: the Aug 13 "Session 3" becomes
    // Session 4, Aug 25 "Session 4" (cancelled) becomes Session 5, and
    // Sep 8 "Session 5" (scheduled) becomes Session 6.
    const renamed4 = await prisma.appointment.updateMany({
      where: { clientId: CLIENT_ID, title: "Session 3 — Sculpt Start™", startsAt: new Date("2026-08-13T14:00:00.000Z") },
      data: { title: "Session 4 — Sculpt Start™" },
    });
    const renamed5 = await prisma.appointment.updateMany({
      where: { clientId: CLIENT_ID, title: "Session 4 — Sculpt Start™", startsAt: new Date("2026-08-25T15:00:00.000Z") },
      data: { title: "Session 5 — Sculpt Start™" },
    });
    const renamed6 = await prisma.appointment.updateMany({
      where: { clientId: CLIENT_ID, title: "Session 5 — Sculpt Start™", startsAt: new Date("2026-09-08T15:00:00.000Z") },
      data: { title: "Session 6 — Sculpt Start™" },
    });

    return NextResponse.json({
      success: true,
      newAppointment,
      updatedMeasurementCount: updatedMeasurement.count,
      renamed4Count: renamed4.count,
      renamed5Count: renamed5.count,
      renamed6Count: renamed6.count,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
