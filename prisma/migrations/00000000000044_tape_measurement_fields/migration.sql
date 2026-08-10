-- Add neck/shoulder to the existing body_measurements table (correct
-- home for tape-measure circumferences — supersedes the mistaken
-- Measurement-table columns from the same day, which were never used).
ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "neckCm" DOUBLE PRECISION;
ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "shoulderCm" DOUBLE PRECISION;

-- Clean up: drop the mistakenly-added tape-measure columns on
-- "measurements" (RENPHO table) from the same session — Diana's data
-- there is being re-written into body_measurements instead.
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "neckCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "shoulderCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "bicepsLeftCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "bicepsRightCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "chestCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "waistCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "abdomenCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "hipCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "thighLeftCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "thighRightCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "calfLeftCm";
ALTER TABLE "measurements" DROP COLUMN IF EXISTS "calfRightCm";
