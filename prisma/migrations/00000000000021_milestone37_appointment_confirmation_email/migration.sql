-- Body Shaper System™ — Milestone 37: Appointment Confirmation email
-- Additive only, single statement (safe — nothing else in this
-- migration references the new value in the same transaction).
ALTER TYPE "EmailTemplate" ADD VALUE 'APPOINTMENT_CONFIRMATION';
