-- System Completion™ landing page fields on blueprint_assessments
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "completionHighlights" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "completionPhotoUrls" JSONB;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "nextSystemName" TEXT;
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "nextSystemProposal" TEXT;
