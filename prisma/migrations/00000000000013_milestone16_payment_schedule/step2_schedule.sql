-- Body Shaper System™ BSS Hub — Milestone 16, STEP 2 of 2
-- Run this AFTER step1_enum.sql has finished and committed.

ALTER TABLE "payments" ADD COLUMN "dueDate" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN "installmentNumber" INTEGER;
ALTER TABLE "payments" ADD COLUMN "installmentTotal" INTEGER;
