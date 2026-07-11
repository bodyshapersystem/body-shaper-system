-- Body Shaper System™ BSS Hub — Milestone 9, STEP 1 of 2
-- Run this FIRST, by itself, and let it finish before running step2.

ALTER TYPE "AssessmentStatus" ADD VALUE 'INTAKE_SUBMITTED';
ALTER TYPE "AssessmentStatus" ADD VALUE 'BASELINE_PENDING';
ALTER TYPE "AssessmentStatus" ADD VALUE 'BASELINE_COMPLETED';
ALTER TYPE "AssessmentStatus" ADD VALUE 'VALIDATED';
ALTER TYPE "AssessmentStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "AssessmentStatus" ADD VALUE 'COMPLETED';
