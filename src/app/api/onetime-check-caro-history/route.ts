import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrs6gl0l0003jx040j1y7zlk";

export async function GET() {
  try {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { measuredAt: "asc" },
    });
    return NextResponse.json({ success: true, measurements });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
