-- Milestone 22, STEP 2 of 2. Run AFTER step1_enum.sql has finished.
ALTER TABLE "documents" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL_ONLY';
