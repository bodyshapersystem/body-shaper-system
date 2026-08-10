import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cols = ["neckCm","shoulderCm","bicepsLeftCm","bicepsRightCm","chestCm","waistCm","abdomenCm","hipCm","thighLeftCm","thighRightCm","calfLeftCm","calfRightCm"];
    for (const c of cols) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "${c}" DOUBLE PRECISION;`);
    }
    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'measurements' AND column_name = ANY($1);
    `, cols);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
