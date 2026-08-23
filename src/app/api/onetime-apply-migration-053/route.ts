import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tech_support_purchases" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "systemName" TEXT NOT NULL,
          "addonType" TEXT NOT NULL,
          "sessionsAdded" INTEGER NOT NULL,
          "amountCents" INTEGER NOT NULL,
          "stripeSessionId" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "bookingStatus" TEXT NOT NULL DEFAULT 'NOT_BOOKED',
          "purchasedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "tech_support_purchases_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "tech_support_purchases_stripeSessionId_key" ON "tech_support_purchases"("stripeSessionId");`);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "tech_support_purchases" ADD CONSTRAINT "tech_support_purchases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const check = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_name = 'tech_support_purchases';`);
    return NextResponse.json({ success: true, tables: check });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
