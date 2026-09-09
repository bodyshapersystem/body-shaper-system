import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtfsgbe0003jp04h57dkoji";

export async function GET() {
  try {
    const assessment = await prisma.blueprintAssessment.findFirst({
      where: { clientId: CLIENT_ID },
      orderBy: { version: "desc" },
    });

    const scanDate = new Date("2026-09-08T18:00:00.000Z");

    const measurement = await prisma.measurement.create({
      data: {
        clientId: CLIENT_ID,
        assessmentId: assessment?.id,
        scanDate,
        weightKg: 61.05,
        bodyFatPercent: 28.3,
        proteinPercent: 14.3,
        bodyWaterPercent: 52.5,
        muscleMassKg: 40.84,
        skeletalMuscleKg: 24.11,
        boneMassKg: 2.90,
        deviceSource: "RENPHO Health",
        sessionNumber: 6,
        notes: "Imported from RENPHO report. Body fat/protein/water given as mass (kg); converted to percentages using the reported weight (17.28/61.05=28.3% fat, 8.73/61.05=14.3% protein, 32.05/61.05=52.5% water).",
      },
    });

    // Mark Session 6 (Sep 8) as completed, since this scan confirms the
    // session actually happened.
    const updatedAppointment = await prisma.appointment.updateMany({
      where: { clientId: CLIENT_ID, title: "Session 6 — Sculpt Start™", startsAt: new Date("2026-09-08T15:00:00.000Z") },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ success: true, measurement, updatedAppointmentCount: updatedAppointment.count });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
