-- Body Shaper System™ BSS Hub — Milestone 21: Client Records™ (Documents V2)
-- Additive only. Run as one script. Existing documents default to
-- ADDITIONAL_FILES — no existing record is broken or reclassified
-- incorrectly; the Owner can re-categorize them from the UI.

CREATE TYPE "DocumentCategory" AS ENUM (
  'WELCOME_GUIDE',
  'POLICIES_APPOINTMENTS',
  'CONSENT_TREATMENT',
  'PHOTOGRAPHY_AUTHORIZATION',
  'BODY_BLUEPRINT_PDF',
  'FINAL_REPORT',
  'RECEIPTS_INVOICES',
  'PROGRESS_PHOTOS',
  'RENPHO_REPORTS',
  'ADDITIONAL_FILES'
);

ALTER TABLE "documents" ADD COLUMN "category" "DocumentCategory" NOT NULL DEFAULT 'ADDITIONAL_FILES';
