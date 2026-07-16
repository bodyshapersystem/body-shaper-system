-- Milestone 58: Client Import — real fields for legacy/historical
-- client data brought in from CSV/Excel imports.

ALTER TABLE "clients" ADD COLUMN "address" TEXT;
ALTER TABLE "clients" ADD COLUMN "birthday" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN "importedLastAppointmentAt" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN "importedLastTreatment" TEXT;
ALTER TABLE "clients" ADD COLUMN "importedLifetimeValueCents" INTEGER;
ALTER TABLE "clients" ADD COLUMN "importSource" TEXT;
