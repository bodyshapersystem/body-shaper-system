-- Body Shaper System™ BSS Hub — Milestone 3, STEP 1 of 2
-- Run this FIRST, by itself, and let it finish before running step2.
-- Adds new PortalStatus values for the automated invitation/email flow.

ALTER TYPE "PortalStatus" ADD VALUE 'NOT_CREATED';
ALTER TYPE "PortalStatus" ADD VALUE 'INVITATION_SENT';
ALTER TYPE "PortalStatus" ADD VALUE 'INVITATION_EXPIRED';
ALTER TYPE "PortalStatus" ADD VALUE 'FAILED';
