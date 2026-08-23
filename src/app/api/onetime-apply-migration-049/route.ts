import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "peptide_protocols" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "peptideName" TEXT NOT NULL,
          "dose" TEXT,
          "frequency" TEXT NOT NULL,
          "injectionDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "injectionTime" TEXT NOT NULL,
          "injectionSite" TEXT,
          "protocolStartDate" TIMESTAMP(3),
          "provider" TEXT,
          "notes" TEXT,
          "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
          "refillOrderByDate" TIMESTAMP(3),
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "peptide_protocols_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "peptide_protocols" ADD CONSTRAINT "peptide_protocols_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "injectionSite" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "appetite" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "energy" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "bloating" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "digestion" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "sleepRating" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "mood" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "nausea" INTEGER;`);

    const check = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'peptide_protocols';
    `);
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'peptide_logs' AND column_name IN ('injectionSite','appetite','energy','bloating','digestion','sleepRating','mood','nausea');
    `);
    return NextResponse.json({ success: true, tables: check, columns });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
