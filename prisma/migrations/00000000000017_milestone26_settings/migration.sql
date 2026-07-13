-- Body Shaper System™ BSS Hub — Milestone 26: Settings™
-- Additive only. Run as one script. All new columns have defaults so
-- existing rows are unaffected.

ALTER TABLE "business_settings" ADD COLUMN "website" TEXT;
ALTER TABLE "business_settings" ADD COLUMN "logoStoragePath" TEXT;
ALTER TABLE "business_settings" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/New_York';
ALTER TABLE "business_settings" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'English';
ALTER TABLE "business_settings" ADD COLUMN "measurementUnits" TEXT NOT NULL DEFAULT 'Imperial';
ALTER TABLE "business_settings" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "business_settings" ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY';
ALTER TABLE "business_settings" ADD COLUMN "weekStartsOn" TEXT NOT NULL DEFAULT 'Monday';

ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "appointmentReminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "paymentNotifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "leadNotifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "weeklyReports" BOOLEAN NOT NULL DEFAULT true;
