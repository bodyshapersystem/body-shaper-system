-- Milestone 59: real, simple storage for legacy contacts with no
-- email on file — Lead and Client both require email (can't fake
-- one), so these live in their own lightweight table for future SMS
-- outreach per direction.

CREATE TABLE "imported_contacts" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "notes" TEXT,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "imported_contacts_pkey" PRIMARY KEY ("id")
);
