-- Body Shaper System™ BSS Hub — Milestone 4, STEP 2 of 2
-- Run this AFTER step1_enum.sql has finished and committed.
--
-- Expands email_events for the multi-identity sender architecture
-- (hello@ / blueprint@ / concierge@bodyshapersystem.com):
--   - clientId becomes optional — the Blueprint Received email fires
--     at the Lead stage, before a Client record exists.
--   - leadId added so lead-stage emails still get logged.
--   - senderEmail records which identity actually sent it.
--   - openedAt/clickedAt reserved for future Resend webhook/analytics
--     wiring (Email Center) — nullable, not populated yet.

ALTER TABLE "email_events" ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE "email_events" ADD COLUMN "leadId" TEXT REFERENCES "leads"("id") ON DELETE CASCADE;
ALTER TABLE "email_events" ADD COLUMN "senderEmail" TEXT;
ALTER TABLE "email_events" ADD COLUMN "openedAt" TIMESTAMP(3);
ALTER TABLE "email_events" ADD COLUMN "clickedAt" TIMESTAMP(3);
