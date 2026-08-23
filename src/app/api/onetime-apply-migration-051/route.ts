import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "whr" DOUBLE PRECISION;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "smi" DOUBLE PRECISION;`);

    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'measurements' AND column_name IN ('whr','smi');
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
