ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentRecommended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentHoursPerDay" INTEGER;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentDuration" INTEGER;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentDurationUnit" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "compressionGarmentNote" TEXT;
