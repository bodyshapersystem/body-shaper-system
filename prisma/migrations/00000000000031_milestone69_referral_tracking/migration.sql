-- Milestone 69: real referral tracking, powers "Invite & Earn" —
-- +250 Society Points automatically when a referred lead converts
-- and completes a qualifying purchase.

ALTER TABLE "leads" ADD COLUMN "referredByClientId" TEXT;
ALTER TABLE "leads" ADD COLUMN "referralRewardGranted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "leads" ADD CONSTRAINT "leads_referredByClientId_fkey"
  FOREIGN KEY ("referredByClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
