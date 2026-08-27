import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CLIENT_ID = "cmt5vrhsu000fic04ubv2rnmn";

export async function GET() {
  try {
    const measurements = await prisma.measurement.findMany({
      where: { clientId: CLIENT_ID },
      orderBy: { scanDate: "asc" },
    });
    const dailyTrackers = await prisma.dailyTracker.findMany({
      where: { clientId: CLIENT_ID, weightLbs: { not: null } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ success: true, measurements, dailyTrackers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
