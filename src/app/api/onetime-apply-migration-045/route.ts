import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "sessionNumber" INTEGER;`);
    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'photos' AND column_name = 'sessionNumber';
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
