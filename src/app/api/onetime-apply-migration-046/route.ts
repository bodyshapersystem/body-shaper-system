import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "reviewRequestSentAt" TIMESTAMP(3);`);
    await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'GOOGLE_REVIEW_REQUEST';`);

    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'blueprint_assessments' AND column_name IN ('completedAt','reviewRequestSentAt');
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
