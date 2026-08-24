import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "daily_trackers" ADD COLUMN IF NOT EXISTS "proteinGrams" DOUBLE PRECISION;`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "nudge_logs" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "scheduledDate" TIMESTAMP(3) NOT NULL,
          "scheduledTime" TEXT NOT NULL DEFAULT '',
          "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "nudge_logs_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "nudge_logs_clientId_category_scheduledDate_scheduledTime_key" ON "nudge_logs"("clientId", "category", "scheduledDate", "scheduledTime");`);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const nudgeEnums = ["NUDGE_HYDRATION","NUDGE_PROTEIN","NUDGE_COMPRESSION","NUDGE_MOVEMENT","NUDGE_SLEEP","NUDGE_PEPTIDE_UPCOMING","NUDGE_PEPTIDE_OVERDUE","NUDGE_APPOINTMENT","NUDGE_WEEKLY_CHECKIN"];
    for (const val of nudgeEnums) {
      await prisma.$executeRawUnsafe(`ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS '${val}';`);
    }

    const check = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_name = 'nudge_logs';`);
    const check2 = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_trackers' AND column_name = 'proteinGrams';`);
    return NextResponse.json({ success: true, tables: check, proteinColumn: check2 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
