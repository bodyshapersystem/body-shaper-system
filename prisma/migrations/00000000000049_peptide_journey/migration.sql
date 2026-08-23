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

DO $$ BEGIN
  ALTER TABLE "peptide_protocols" ADD CONSTRAINT "peptide_protocols_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "injectionSite" TEXT;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "appetite" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "energy" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "bloating" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "digestion" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "sleepRating" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "mood" INTEGER;
ALTER TABLE "peptide_logs" ADD COLUMN IF NOT EXISTS "nausea" INTEGER;
