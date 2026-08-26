import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const measurement = await prisma.bodyMeasurement.findUnique({
      where: { id: "cmss02kz10003jv04a55q1h2k" },
    });
    if (!measurement) return NextResponse.json({ success: false, error: "Measurement not found." }, { status: 404 });
    if (measurement.waistCm !== 66.2) {
      return NextResponse.json({ success: false, error: `Expected waistCm=66.2 but found ${measurement.waistCm}. Aborting to avoid overwriting the wrong record.` }, { status: 409 });
    }

    const updated = await prisma.bodyMeasurement.update({
      where: { id: "cmss02kz10003jv04a55q1h2k" },
      data: {
        waistCm: 69.6,
        notes: (measurement.notes ?? "") + " [Waist corrected from 66.2cm to 69.6cm — original entry was a measurement error, per Emmy.]",
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
