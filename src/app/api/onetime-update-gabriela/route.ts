import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export async function GET() {
  try {
    const measurement = await prisma.measurement.findFirst({
      where: { clientId: CLIENT_ID, deviceSource: "RENPHO Health" },
      orderBy: { createdAt: "desc" },
    });
    if (!measurement) return NextResponse.json({ success: false, error: "No RENPHO measurement found to update." }, { status: 404 });

    const updated = await prisma.measurement.update({
      where: { id: measurement.id },
      data: {
        weightKg: 52.75,
        bodyFatPercent: 26.2,
        proteinPercent: 14.8,
        bodyWaterPercent: 54.1,
        notes: "Imported from RENPHO report. Weight confirmed at 52.75kg; body fat/protein/water were given in the source report as mass (kg) — converted to percentages using the confirmed weight (13.82/52.75=26.2% fat, 7.81/52.75=14.8% protein, 28.54/52.75=54.1% water), cross-checked against the report's own separately-listed 26.2% body fat figure.",
      },
    });

    return NextResponse.json({ success: true, measurement: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
