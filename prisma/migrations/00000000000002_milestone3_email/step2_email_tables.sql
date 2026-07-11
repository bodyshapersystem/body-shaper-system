-- Body Shaper System™ BSS Hub — Milestone 3, STEP 2 of 2
-- Run this AFTER step1_enum.sql has finished and committed.
-- Adds automated email delivery tracking (Resend) for the
-- Lead -> Client -> Portal Activation flow.

CREATE TYPE "EmailTemplate" AS ENUM ('WELCOME_ACTIVATION', 'BODY_BLUEPRINT_COMPLETED', 'PAYMENT_CONFIRMATION');
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- ---------- Invitation delivery tracking ----------

ALTER TABLE "portal_invitations" ADD COLUMN "lastSentAt" TIMESTAMP(3);
ALTER TABLE "portal_invitations" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;

-- ---------- Email delivery log ----------
-- One row per send attempt (success or failure) — the permanent audit
-- trail for the Hub's "View Email Log". Never deleted.

CREATE TABLE "email_events" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "template" "EmailTemplate" NOT NULL,
  "recipient" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'resend',
  "providerMessageId" TEXT,
  "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
