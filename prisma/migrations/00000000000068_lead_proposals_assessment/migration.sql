ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROPOSAL_CREATED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROPOSAL_ACCEPTED';
ALTER TABLE "client_proposals" ADD COLUMN IF NOT EXISTS "leadId" TEXT;
ALTER TABLE "client_proposals" ADD COLUMN IF NOT EXISTS "assessmentEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "client_proposals" ADD COLUMN IF NOT EXISTS "assessmentDate" DATE;
ALTER TABLE "client_proposals" ADD COLUMN IF NOT EXISTS "assessmentTimeConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "client_proposals" ADD COLUMN IF NOT EXISTS "assessmentTime" TEXT;
CREATE INDEX IF NOT EXISTS "client_proposals_leadId_idx" ON "client_proposals"("leadId");
DO $$ BEGIN
  ALTER TABLE "client_proposals" ADD CONSTRAINT "client_proposals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE "proposal_checkouts" ADD COLUMN IF NOT EXISTS "creditCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "proposal_checkouts" ADD COLUMN IF NOT EXISTS "creditFromCheckoutId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "proposal_checkouts_creditFromCheckoutId_key" ON "proposal_checkouts"("creditFromCheckoutId");
ALTER TABLE "proposal_settings" ADD COLUMN IF NOT EXISTS "assessmentCents" INTEGER NOT NULL DEFAULT 35000;
-- link existing pre-conversion proposals that carried the lead id in their notes
UPDATE "client_proposals" p SET "leadId" = l.id FROM "leads" l
  WHERE p."leadId" IS NULL AND p."internalNotes" LIKE 'Lead ID: ' || l.id || '%';
