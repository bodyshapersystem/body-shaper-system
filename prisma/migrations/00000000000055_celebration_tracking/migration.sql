ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "lastCelebratedMeasurementId" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "lastCelebratedBodyMeasurementId" TEXT;
