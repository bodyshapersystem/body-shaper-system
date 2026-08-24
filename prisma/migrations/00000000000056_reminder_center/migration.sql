ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "quietHoursStart" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "quietHoursEnd" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "hydrationGoalGlasses" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "proteinGoalGrams" INTEGER;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "movementGoalSteps" INTEGER NOT NULL DEFAULT 8000;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionDays" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionHoursRequired" DOUBLE PRECISION;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionProtocolStartDate" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "compressionProtocolEndDate" TIMESTAMP(3);

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

CREATE UNIQUE INDEX IF NOT EXISTS "reminder_preferences_clientId_category_key" ON "reminder_preferences"("clientId", "category");

DO $$ BEGIN
  ALTER TABLE "reminder_preferences" ADD CONSTRAINT "reminder_preferences_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
