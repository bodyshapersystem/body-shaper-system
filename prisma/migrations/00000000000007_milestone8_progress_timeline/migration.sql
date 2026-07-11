-- Body Shaper System™ BSS Hub — Milestone 8: Progress Timeline expansion
-- Run as one script. progress_snapshots has zero real rows (created
-- last migration this same session), so this is a safe structural
-- change, not a data migration.

ALTER TABLE "progress_snapshots" RENAME COLUMN "calculatedAt" TO "generatedAt";
ALTER TABLE "progress_snapshots" RENAME COLUMN "weightLostKg" TO "weightDeltaKg";
ALTER TABLE "progress_snapshots" RENAME COLUMN "bodyFatReducedPercent" TO "bodyFatDeltaPercent";
ALTER TABLE "progress_snapshots" RENAME COLUMN "muscleGainedKg" TO "estimatedMuscleGainKg";
ALTER TABLE "progress_snapshots" DROP COLUMN "waistCmLost";

ALTER TABLE "progress_snapshots" ADD COLUMN "date" TIMESTAMP(3);
ALTER TABLE "progress_snapshots" ADD COLUMN "visceralFatDelta" DOUBLE PRECISION;
ALTER TABLE "progress_snapshots" ADD COLUMN "skeletalMuscleDeltaKg" DOUBLE PRECISION;
ALTER TABLE "progress_snapshots" ADD COLUMN "inchesLost" DOUBLE PRECISION;
ALTER TABLE "progress_snapshots" ADD COLUMN "estimatedFatLossKg" DOUBLE PRECISION;
ALTER TABLE "progress_snapshots" ADD COLUMN "adherenceScore" DOUBLE PRECISION;
ALTER TABLE "progress_snapshots" ADD COLUMN "specialistSummary" TEXT;
ALTER TABLE "progress_snapshots" ADD COLUMN "aiSummary" TEXT;

-- Backfill "date" for any existing rows (none expected) before making
-- it required, then enforce NOT NULL going forward.
UPDATE "progress_snapshots" SET "date" = "generatedAt" WHERE "date" IS NULL;
ALTER TABLE "progress_snapshots" ALTER COLUMN "date" SET NOT NULL;
