-- RENPHO Health auto-sync: link a client to a profile ("user") in the studio's RENPHO account,
-- and de-duplicate imported scans by their RENPHO record id.
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "renphoUserId" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "renphoName" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "renphoTable" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "renphoSyncedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "clients_renphoUserId_key" ON "clients"("renphoUserId");
ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "externalRaw" JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS "measurements_externalId_key" ON "measurements"("externalId");
