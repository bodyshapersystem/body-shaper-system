-- Milestone 53: real Client Journey Notification Center — one table,
-- powers the Owner Hub activity feed, Dashboard widget, and each
-- client's own Activity Log (same records, filtered by clientId).

CREATE TYPE "NotificationCategory" AS ENUM ('PORTAL', 'FORMS', 'APPOINTMENTS', 'PAYMENTS', 'DOCUMENTS', 'REWARDS', 'GENERAL');

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "clientId" TEXT,
  "category" "NotificationCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "linkUrl" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);
CREATE INDEX "notifications_clientId_idx" ON "notifications"("clientId");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Real per-Owner email-notification toggles, per direction: "these
-- settings should only affect email delivery — the Notification
-- Center should always receive every event" (the Notification table
-- above already receives every event unconditionally; these three
-- fields only gate the ADDITIONAL email send).
ALTER TABLE "users" ADD COLUMN "notifyPortalActivated" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notifyWaiverCompleted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notifyBlueprintCompleted" BOOLEAN NOT NULL DEFAULT true;
