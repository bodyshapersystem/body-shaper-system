ALTER TABLE "peptide_protocols" ADD COLUMN IF NOT EXISTS "goalCategory" TEXT;
ALTER TABLE "peptide_protocols" ADD COLUMN IF NOT EXISTS "customGoal" TEXT;
