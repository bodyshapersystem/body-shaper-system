-- Milestone 57: Collaborations & Ambassadors — real financial fields
-- and workflow, so Collab/Ambassador clients are a first-class path,
-- not a $0 invoice workaround.

ALTER TYPE "ClientType" ADD VALUE 'VIP';

CREATE TYPE "CollaborationType" AS ENUM ('INFLUENCER', 'CREATOR', 'AMBASSADOR', 'MODEL', 'PARTNERSHIP', 'CUSTOM');
CREATE TYPE "AgreementStatus" AS ENUM ('PENDING', 'SIGNED', 'NOT_REQUIRED');

CREATE TABLE "collaborations" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "collaborationType" "CollaborationType" NOT NULL DEFAULT 'AMBASSADOR',
  "treatmentValueCents" INTEGER NOT NULL DEFAULT 0,
  "clientContributionCents" INTEGER NOT NULL DEFAULT 0,
  "campaignName" TEXT,
  "instagramHandle" TEXT,
  "deliverables" TEXT,
  "internalNotes" TEXT,
  "managerId" TEXT,
  "agreementStatus" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "collaborations_clientId_key" ON "collaborations"("clientId");

ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_managerId_fkey"
  FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
