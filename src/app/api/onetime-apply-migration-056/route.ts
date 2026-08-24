import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "quietHoursStart" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "quietHoursEnd" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "hydrationGoalGlasses" INTEGER NOT NULL DEFAULT 8;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "proteinGoalGrams" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "movementGoalSteps" INTEGER NOT NULL DEFAULT 8000;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionDays" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionHoursRequired" DOUBLE PRECISION;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionProtocolStartDate" TIMESTAMP(3);`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionProtocolEndDate" TIMESTAMP(3);`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "reminder_preferences" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "enabled" BOOLEAN NOT NULL DEFAULT true,
          "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
          "reminderTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "relevantDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "reminder_preferences_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "reminder_preferences_clientId_category_key" ON "reminder_preferences"("clientId", "category");`);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "reminder_preferences" ADD CONSTRAINT "reminder_preferences_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const check = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_name = 'reminder_preferences';`);
    return NextResponse.json({ success: true, tables: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
