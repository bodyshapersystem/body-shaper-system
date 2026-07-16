-- Milestone 52: real Home/Studio location for appointments, chosen by
-- the therapist when scheduling — powers the Client Portal Appointments
-- redesign (location, service zone, arrival window, studio address).

CREATE TYPE "AppointmentLocationType" AS ENUM ('HOME', 'STUDIO');

ALTER TABLE "appointments"
  ADD COLUMN "locationType" "AppointmentLocationType" NOT NULL DEFAULT 'HOME';
