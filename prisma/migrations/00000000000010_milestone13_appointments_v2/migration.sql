-- Body Shaper System™ BSS Hub — Milestone 13: Appointments V2
-- Additive only. Run as one script.

ALTER TABLE "appointments" ADD COLUMN "technologies" JSONB;
ALTER TABLE "appointments" ADD COLUMN "estimatedMinutes" INTEGER;
