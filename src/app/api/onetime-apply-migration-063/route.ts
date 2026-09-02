import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentRecommended" BOOLEAN NOT NULL DEFAULT false;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentHoursPerDay" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentDuration" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentDurationUnit" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentNote" TEXT;`);
    const check = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'blueprint_assessments' AND column_name LIKE 'compressionGarment%';
    `);
    return NextResponse.json({ success: true, columns: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
