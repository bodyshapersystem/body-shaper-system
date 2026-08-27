import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const record = await prisma.measurement.findUnique({
      where: { id: "cmt7ehxkz0001jy040sm6naol" },
    });
    if (!record) return NextResponse.json({ success: false, error: "Record not found — may already be deleted." }, { status: 404 });

    // Safety check: only delete if it really is the partial weight-only duplicate we identified.
    if (record.weightKg !== 89 || record.bodyFatPercent !== null || record.bmi !== null) {
      return NextResponse.json({ success: false, error: "Record doesn't match the expected partial duplicate — aborting to avoid deleting the wrong one.", record }, { status: 409 });
    }

    await prisma.measurement.delete({ where: { id: "cmt7ehxkz0001jy040sm6naol" } });
    return NextResponse.json({ success: true, deleted: record });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
