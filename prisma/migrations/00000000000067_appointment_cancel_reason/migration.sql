ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'APPOINTMENT_CANCELLED';
-- legacy reschedules (old row kept as CANCELLED) never count as client cancellations
UPDATE "appointments" SET "cancelReason" = 'RESCHEDULED' WHERE "status" = 'CANCELLED' AND "cancelReason" IS NULL AND "notes" LIKE '%[Rescheduled to %';
-- a reschedule never consumes a session
UPDATE "appointments" SET "sessionForfeited" = false WHERE "cancelReason" = 'RESCHEDULED' AND "sessionForfeited" = true;
