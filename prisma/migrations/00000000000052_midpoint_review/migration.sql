CREATE TABLE IF NOT EXISTS "midpoint_reviews" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasSufficientData" BOOLEAN NOT NULL DEFAULT false,
    "baselineWeightKg" DOUBLE PRECISION,
    "baselineBodyFatPercent" DOUBLE PRECISION,
    "baselineMuscleMassKg" DOUBLE PRECISION,
    "baselineSkeletalMuscleKg" DOUBLE PRECISION,
    "baselineBodyWaterPercent" DOUBLE PRECISION,
    "baselineWaistCm" DOUBLE PRECISION,
    "midpointWeightKg" DOUBLE PRECISION,
    "midpointBodyFatPercent" DOUBLE PRECISION,
    "midpointMuscleMassKg" DOUBLE PRECISION,
    "midpointSkeletalMuscleKg" DOUBLE PRECISION,
    "midpointBodyWaterPercent" DOUBLE PRECISION,
    "midpointWaistCm" DOUBLE PRECISION,
    "insightText" TEXT,
    "nextPhaseCategory" TEXT,
    "nextPhaseCopy" TEXT,
    "suggestedAddOn" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "dataReadyEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "dataMissingEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midpoint_reviews_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "midpoint_reviews" ADD CONSTRAINT "midpoint_reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "midpoint_reviews" ADD CONSTRAINT "midpoint_reviews_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "blueprint_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'MIDPOINT_DATA_READY';
ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'MIDPOINT_DATA_MISSING';
