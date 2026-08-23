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

CREATE UNIQUE INDEX IF NOT EXISTS "tech_support_purchases_stripeSessionId_key" ON "tech_support_purchases"("stripeSessionId");

DO $$ BEGIN
  ALTER TABLE "tech_support_purchases" ADD CONSTRAINT "tech_support_purchases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
