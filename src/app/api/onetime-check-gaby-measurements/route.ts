import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmrtjfdeb0007ih04c5hp3h0s";

export async function GET() {
  try {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { measuredAt: "desc" },
      take: 1,
    });
    return NextResponse.json({ success: true, measurements });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
