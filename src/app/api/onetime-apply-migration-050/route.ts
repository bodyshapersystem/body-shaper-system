import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_protocols" ADD COLUMN IF NOT EXISTS "goalCategory" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_protocols" ADD COLUMN IF NOT EXISTS "customGoal" TEXT;`);

    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'peptide_protocols' AND column_name IN ('goalCategory','customGoal');
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
