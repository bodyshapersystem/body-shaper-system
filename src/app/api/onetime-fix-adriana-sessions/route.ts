import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmry7ihpb0007l204syoij8dl";

export async function GET() {
  try {
    // 1) Sep 3: delete the wrongly-combined "Session 2" (listed Exilis+EMS,
    // but only EMS was actually done that day). The real EMS-only log
    // already exists separately.
    const deleted = await prisma.appointment.delete({
      where: { id: "cmthxaban0001jx04h3vbz4er" },
    });

    // Relabel the real EMS-only session from Sep 3 as the properly
    // numbered Session 2.
    const renamed2 = await prisma.appointment.update({
      where: { id: "cmtm6wfoa000fla04hpgjndj6" },
      data: { title: "Session 2 — Sculpt Signature™" },
    });

    // 2) Today (Sep 10): the scheduled "Session 3" combined Exilis+EMS —
    // Exilis was done first (this real session), so keep this record as
    // Session 3, Exilis only, and mark it completed.
    const fixedSession3 = await prisma.appointment.update({
      where: { id: "cmtt4tg4g0001l204go4o98wt" },
      data: { status: "COMPLETED", technologies: [{ name: "Exilis Elite™", minutes: 50 }] },
    });

    // EMS was done second, right after — relabel the real EMS-only log
    // from today as Session 4.
    const renamed4 = await prisma.appointment.update({
      where: { id: "cmtw7vuxq0001jt04v0ntd2p1" },
      data: { title: "Session 4 — Sculpt Signature™" },
    });

    // 3) Record today's real RENPHO scan (taken after both Exilis + EMS),
    // linked to Session 4 (the final state of today's real session).
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate: new Date("2026-09-11T00:30:00.000Z"),
        weightKg: 60.0,
        bodyFatPercent: 37.2,
        proteinPercent: 12.6,
        bodyWaterPercent: 46.1,
        muscleMassKg: 35.16,
        skeletalMuscleKg: 20.4,
        boneMassKg: 2.5,
        deviceSource: "RENPHO Health",
        sessionNumber: 4,
        notes: "Imported from RENPHO report. Body fat/protein/water given as mass (kg); converted to percentages using the reported weight (22.32/60.00=37.2% fat, 7.56/60.00=12.6% protein, 27.66/60.00=46.1% water).",
      },
    });

    return NextResponse.json({ success: true, deleted, renamed2, fixedSession3, renamed4, measurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
