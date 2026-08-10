import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "neckCm" DOUBLE PRECISION;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "shoulderCm" DOUBLE PRECISION;`);

    const dropCols = ["neckCm","shoulderCm","bicepsLeftCm","bicepsRightCm","chestCm","waistCm","abdomenCm","hipCm","thighLeftCm","thighRightCm","calfLeftCm","calfRightCm"];
    for (const c of dropCols) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "measurements" DROP COLUMN IF EXISTS "${c}";`);
    }

    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'body_measurements' AND column_name IN ('neckCm','shoulderCm');
    `);
    return NextResponse.json({ success: true, addedColumns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
