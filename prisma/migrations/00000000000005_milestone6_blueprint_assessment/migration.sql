-- Body Shaper System™ BSS Hub — Milestone 6: Blueprint Assessment™
-- Run this as one script (no ALTER TYPE ADD VALUE is used here, so
-- there's no multi-step split needed this time).
--
-- Replaces the old single-JSON-field body_blueprints table with a
-- proper clinical Blueprint Assessment™ architecture that supports
-- multiple assessments per client over time, plus a separate
-- FormSubmission model for post-activation administrative forms
-- (Prepare for Your Experience, Treatment Waiver, etc.) — kept
-- deliberately apart from the clinical journey per direction.

CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED');
CREATE TYPE "PhotoType" AS ENUM ('BEFORE', 'AFTER', 'PROGRESS');
CREATE TYPE "FormType" AS ENUM ('PREPARE_FOR_YOUR_EXPERIENCE', 'TREATMENT_WAIVER');
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'COMPLETED');

-- ---------- Blueprint Assessment™ ----------
-- leadId is set (clientId null) from Jotform intake, pre-activation.
-- @@unique(leadId) means repeat Jotform submissions before activation
-- update the same draft row rather than creating duplicates.
-- clientId gets set at conversion time — RE-LINKING this same row,
-- never copying it into a new one.

CREATE TABLE "blueprint_assessments" (
  "id" TEXT PRIMARY KEY,
  "leadId" TEXT UNIQUE REFERENCES "leads"("id"),
  "clientId" TEXT REFERENCES "clients"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
  "jotformSubmissionId" TEXT,
  "jotformRawData" JSONB,
  "goals" TEXT,
  "treatmentInterests" TEXT,
  "recommendedSystem" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  UNIQUE ("clientId", "version")
);

-- ---------- Body measurements (tape/manual — distinct from Renpho) ----------

CREATE TABLE "body_measurements" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "assessmentId" TEXT REFERENCES "blueprint_assessments"("id") ON DELETE SET NULL,
  "measuredAt" TIMESTAMP(3) NOT NULL,
  "waistCm" DOUBLE PRECISION,
  "hipsCm" DOUBLE PRECISION,
  "chestCm" DOUBLE PRECISION,
  "thighCm" DOUBLE PRECISION,
  "armCm" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT
);

-- ---------- Photos ----------

CREATE TABLE "photos" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "assessmentId" TEXT REFERENCES "blueprint_assessments"("id") ON DELETE SET NULL,
  "type" "PhotoType" NOT NULL,
  "storagePath" TEXT NOT NULL,
  "takenAt" TIMESTAMP(3),
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "uploadedById" TEXT,
  "notes" TEXT
);

-- ---------- Specialist observations (append-only clinical log) ----------

CREATE TABLE "specialist_observations" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT NOT NULL REFERENCES "blueprint_assessments"("id") ON DELETE CASCADE,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Strategy changes (append-only audit trail) ----------

CREATE TABLE "strategy_changes" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT NOT NULL REFERENCES "blueprint_assessments"("id") ON DELETE CASCADE,
  "previousStrategy" TEXT,
  "newStrategy" TEXT NOT NULL,
  "reason" TEXT,
  "changedById" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Form Submissions (administrative documentation ONLY) ----------

CREATE TABLE "form_submissions" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "formType" "FormType" NOT NULL,
  "status" "FormStatus" NOT NULL DEFAULT 'PENDING',
  "version" INTEGER NOT NULL DEFAULT 1,
  "jotformSubmissionId" TEXT,
  "rawData" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Link Renpho scans to an assessment (optional) ----------

ALTER TABLE "measurements" ADD COLUMN "assessmentId" TEXT REFERENCES "blueprint_assessments"("id") ON DELETE SET NULL;

-- ---------- Migrate existing data off body_blueprints, then retire it ----------
-- Same id values are reused (they're globally-unique cuid strings —
-- no collision risk). The most recent version per client becomes
-- ACTIVE; earlier versions become SUPERSEDED. leadId is left null for
-- migrated rows (these clients were already converted before this
-- migration existed, so there's no pre-activation lead-stage draft
-- to reconstruct).

INSERT INTO "blueprint_assessments"
  ("id", "clientId", "version", "status", "jotformRawData", "goals", "treatmentInterests", "recommendedSystem", "createdAt", "updatedAt", "createdById")
SELECT
  bb."id",
  bb."clientId",
  bb."version",
  CASE
    WHEN bb."version" = (SELECT MAX(bb2."version") FROM "body_blueprints" bb2 WHERE bb2."clientId" = bb."clientId")
    THEN 'ACTIVE'::"AssessmentStatus"
    ELSE 'SUPERSEDED'::"AssessmentStatus"
  END,
  bb."formAnswers",
  bb."goals",
  bb."treatmentInterests",
  bb."recommendedSystem",
  bb."createdAt",
  bb."createdAt",
  bb."createdById"
FROM "body_blueprints" bb;

DROP TABLE "body_blueprints";

-- ---------- Retire the redundant Lead.bodyBlueprint field ----------
-- This data now lives exclusively in blueprint_assessments.jotformRawData
-- (linked via leadId pre-activation). No data loss: any lead that had
-- this populated already has a corresponding blueprint_assessments
-- row from this same migration going forward via the webhook.

ALTER TABLE "leads" DROP COLUMN "bodyBlueprint";
