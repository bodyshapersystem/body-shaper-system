import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "midpoint_reviews" ADD COLUMN IF NOT EXISTS "clientRequestedExploreAt" TIMESTAMP(3);`);
    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'midpoint_reviews' AND column_name = 'clientRequestedExploreAt';
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
