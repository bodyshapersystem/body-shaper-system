import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "rescheduleCount" INTEGER NOT NULL DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "sessionForfeited" BOOLEAN NOT NULL DEFAULT false;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "tipCents" INTEGER;`);
    const check = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE (table_name = 'appointments' AND column_name IN ('rescheduleCount', 'sessionForfeited'))
      OR (table_name = 'payments' AND column_name = 'tipCents');
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
