import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "peptide_logs" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "peptideName" TEXT NOT NULL,
          "administeredAt" TIMESTAMP(3) NOT NULL,
          "dosage" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "peptide_logs_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "peptide_logs" ADD CONSTRAINT "peptide_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const check = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'peptide_logs';
    `);
    return NextResponse.json({ success: true, tables: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
