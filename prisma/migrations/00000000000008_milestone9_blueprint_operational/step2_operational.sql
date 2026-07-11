-- Body Shaper System™ BSS Hub — Milestone 9, STEP 2 of 2
-- Run this AFTER step1_enum.sql has finished and committed.
-- Blueprint Assessment™ operational Hub interface: first-appointment
-- workflow (professional measurements, body composition, photos,
-- observations, strategy validation).

CREATE TYPE "Visibility" AS ENUM ('INTERNAL_ONLY', 'CLIENT_VISIBLE');

-- ---------- New operational fields on blueprint_assessments ----------

ALTER TABLE "blueprint_assessments" ADD COLUMN "intakeSubmissionDate" TIMESTAMP(3);
ALTER TABLE "blueprint_assessments" ADD COLUMN "baselineAppointmentDate" TIMESTAMP(3);
ALTER TABLE "blueprint_assessments" ADD COLUMN "originalRecommendedSystem" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "initialFrequency" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "validatedFrequency" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "initialSessionCount" INTEGER;
ALTER TABLE "blueprint_assessments" ADD COLUMN "validatedSessionCount" INTEGER;
ALTER TABLE "blueprint_assessments" ADD COLUMN "complementarySessions" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "homeCareGuidance" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "optimizationNotes" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "validationNotes" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "validatedById" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN "validatedAt" TIMESTAMP(3);

-- ---------- Photos / Specialist Observations: visibility ----------

ALTER TABLE "photos" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL_ONLY';
ALTER TABLE "specialist_observations" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL_ONLY';

-- ---------- Remap existing status values to the new operational flow ----------
-- DRAFT (pre-activation) -> INTAKE_SUBMITTED
-- ACTIVE (post-conversion, pre-baseline) -> BASELINE_PENDING
-- Best-effort backfill: intakeSubmissionDate <- createdAt,
-- originalRecommendedSystem <- current recommendedSystem (the
-- earliest value we have on file for pre-existing rows).
-- Note: DRAFT and ACTIVE remain valid (unused) enum values going
-- forward — Postgres doesn't support cleanly removing enum values
-- without recreating the type, and no real workflow depends on them
-- anymore after this migration.

UPDATE "blueprint_assessments" SET
  "status" = 'INTAKE_SUBMITTED',
  "intakeSubmissionDate" = COALESCE("intakeSubmissionDate", "createdAt")
WHERE "status" = 'DRAFT';

UPDATE "blueprint_assessments" SET
  "status" = 'BASELINE_PENDING',
  "intakeSubmissionDate" = COALESCE("intakeSubmissionDate", "createdAt"),
  "originalRecommendedSystem" = COALESCE("originalRecommendedSystem", "recommendedSystem")
WHERE "status" = 'ACTIVE';

ALTER TABLE "blueprint_assessments" ALTER COLUMN "status" SET DEFAULT 'INTAKE_SUBMITTED';
