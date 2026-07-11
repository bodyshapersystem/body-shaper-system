-- Body Shaper System™ BSS Hub — Milestone 2, STEP 1 of 2
-- Run this FIRST, by itself, and let it finish before running step2.
-- (Postgres will not let a new enum value be used by other statements
-- in the same transaction it was added in — hence the split.)

ALTER TYPE "LeadStatus" ADD VALUE 'CONVERTED';
