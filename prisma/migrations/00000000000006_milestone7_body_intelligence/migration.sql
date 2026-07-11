-- Body Shaper System™ BSS Hub — Milestone 7: Body Intelligence™
-- Run this as one script. Both tables being altered (body_measurements,
-- photos) were created in the previous migration this same session
-- with zero real rows in production yet, so these are safe structural
-- changes, not data-loss risks.

-- ---------- Professional Body Measurements: full field list ----------

ALTER TABLE "body_measurements" RENAME COLUMN "createdById" TO "specialistId";
ALTER TABLE "body_measurements" ADD COLUMN "highWaistCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN "lowerAbdomenCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN "rightArmCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN "leftArmCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN "rightThighCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN "leftThighCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" DROP COLUMN "armCm";
ALTER TABLE "body_measurements" DROP COLUMN "thighCm";

-- ---------- Renpho Body Composition: add missing metrics ----------

ALTER TABLE "measurements" ADD COLUMN "skeletalMuscleKg" DOUBLE PRECISION;
ALTER TABLE "measurements" ADD COLUMN "proteinPercent" DOUBLE PRECISION;
ALTER TABLE "measurements" ADD COLUMN "subcutaneousFatPercent" DOUBLE PRECISION;
ALTER TABLE "measurements" ADD COLUMN "fatFreeWeightKg" DOUBLE PRECISION;

-- ---------- Progress Photos: new photo type vocabulary ----------
-- Table has zero real rows (created this session), so drop/recreate
-- the enum cleanly rather than trying to migrate BEFORE/AFTER/PROGRESS
-- values that were never actually used.

ALTER TABLE "photos" RENAME COLUMN "uploadedById" TO "specialistId";
ALTER TABLE "photos" DROP COLUMN "type";
DROP TYPE "PhotoType";
CREATE TYPE "PhotoType" AS ENUM ('FRONT', 'LEFT', 'RIGHT', 'BACK', 'DETAIL');
ALTER TABLE "photos" ADD COLUMN "type" "PhotoType" NOT NULL;

-- ---------- Progress Timeline (architecture only, no calculation job yet) ----------

CREATE TABLE "progress_snapshots" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "assessmentId" TEXT REFERENCES "blueprint_assessments"("id") ON DELETE SET NULL,
  "baselineMeasurementId" TEXT,
  "latestMeasurementId" TEXT,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "weightLostKg" DOUBLE PRECISION,
  "bodyFatReducedPercent" DOUBLE PRECISION,
  "muscleGainedKg" DOUBLE PRECISION,
  "waistCmLost" DOUBLE PRECISION,
  "metrics" JSONB,
  "notes" TEXT
);
