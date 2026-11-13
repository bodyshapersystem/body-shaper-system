-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "societyParticipantId" TEXT,
ADD COLUMN     "societyVisitId" TEXT;

-- CreateTable
CREATE TABLE "society_participants" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EXTERNAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "instagram" TEXT,
    "applicationNote" TEXT,
    "clientId" TEXT,
    "authUserId" TEXT,
    "activationToken" TEXT,
    "referralDiscountCents" INTEGER NOT NULL DEFAULT 0,
    "percentOverride" INTEGER,
    "agreementVersion" TEXT,
    "agreementAcceptedAt" TIMESTAMP(3),
    "payoutMethod" TEXT,
    "payoutHandle" TEXT,
    "internalNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "society_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "society_visits" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'link',
    "landingPath" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "society_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "society_levels" (
    "id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minSales" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "society_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "society_commissions" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "clientId" TEXT,
    "leadId" TEXT,
    "proposalId" TEXT,
    "description" TEXT NOT NULL,
    "baseCents" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "saleNumber" INTEGER NOT NULL,
    "levelName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "society_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "society_payouts" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "method" TEXT,
    "handle" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "society_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "society_participants_code_key" ON "society_participants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "society_participants_email_key" ON "society_participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "society_participants_clientId_key" ON "society_participants"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "society_participants_authUserId_key" ON "society_participants"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "society_participants_activationToken_key" ON "society_participants"("activationToken");

-- CreateIndex
CREATE INDEX "society_visits_participantId_visitedAt_idx" ON "society_visits"("participantId", "visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "society_commissions_proposalId_key" ON "society_commissions"("proposalId");

-- CreateIndex
CREATE INDEX "society_commissions_participantId_status_idx" ON "society_commissions"("participantId", "status");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_societyParticipantId_fkey" FOREIGN KEY ("societyParticipantId") REFERENCES "society_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "society_participants" ADD CONSTRAINT "society_participants_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "society_visits" ADD CONSTRAINT "society_visits_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "society_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "society_commissions" ADD CONSTRAINT "society_commissions_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "society_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "society_commissions" ADD CONSTRAINT "society_commissions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "society_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "society_payouts" ADD CONSTRAINT "society_payouts_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "society_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- House rule: RLS on, no policies (the app talks to these tables only through Prisma on the server).
ALTER TABLE "society_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "society_visits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "society_levels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "society_commissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "society_payouts" ENABLE ROW LEVEL SECURITY;

-- Discount applied at checkout for referrals that came through a collab / ambassador link.
ALTER TABLE "proposal_checkouts" ADD COLUMN IF NOT EXISTS "societyDiscountCents" INTEGER NOT NULL DEFAULT 0;

ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'SOCIETY_APPLICATION';
ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'SOCIETY_APPROVED';
ALTER TYPE "EmailTemplate" ADD VALUE IF NOT EXISTS 'SOCIETY_COMMISSION';

-- Levels decided by Emmy 2026-11-13 (editable in Hub → Shaper Society).
INSERT INTO "society_levels" ("id","sort","name","minSales","percent") VALUES
  ('lvl_1',1,'Level I',1,5),
  ('lvl_2',2,'Level II',6,8),
  ('lvl_3',3,'Level III',11,10),
  ('lvl_4',4,'Level IV',21,12)
ON CONFLICT ("id") DO NOTHING;
