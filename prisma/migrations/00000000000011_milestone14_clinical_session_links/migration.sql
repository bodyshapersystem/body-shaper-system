-- Body Shaper System™ BSS Hub — Milestone 14: Clinical Session architecture
-- Additive only. Run as one script.
-- Every Appointment becomes the permanent home a session's photos,
-- Renpho scans, measurements, payments, and documents CAN link to,
-- in addition to always belonging to the Client directly. No UI
-- wires these up yet — this just prepares the data model.

ALTER TABLE "photos" ADD COLUMN "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL;
ALTER TABLE "measurements" ADD COLUMN "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL;
ALTER TABLE "body_measurements" ADD COLUMN "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL;
ALTER TABLE "payments" ADD COLUMN "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL;
ALTER TABLE "documents" ADD COLUMN "appointmentId" TEXT REFERENCES "appointments"("id") ON DELETE SET NULL;
