import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "sessionNumber" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "sessionNumber" INTEGER;`);

    const updatedMeasurement = await prisma.measurement.update({
      where: { id: "cmtiucfcp0001ju047qruhqkm" },
      data: { sessionNumber: 5 },
    });
    const updatedBodyMeasurement = await prisma.bodyMeasurement.update({
      where: { id: "cmtiucfdc0003ju04ynpnvc45" },
      data: { sessionNumber: 5 },
    });

    return NextResponse.json({ success: true, updatedMeasurement, updatedBodyMeasurement });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
