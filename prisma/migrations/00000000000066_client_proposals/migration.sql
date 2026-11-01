-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "client_proposals" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "clientId" TEXT,
    "clientName" TEXT NOT NULL,
    "locationLabel" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "zones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personalMessage" TEXT,
    "internalNotes" TEXT,
    "programs" JSONB NOT NULL,
    "recommendedKey" TEXT,
    "promoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "showWelcomeVideo" BOOLEAN NOT NULL DEFAULT false,
    "resultCaseIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "programStartDate" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "firstViewedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "selectedProgramKey" TEXT,
    "selectedPaymentMode" TEXT,
    "checkoutStatus" TEXT,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
    "balanceDueCents" INTEGER NOT NULL DEFAULT 0,
    "splitConsentAt" TIMESTAMP(3),
    "splitConsentText" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_events" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_checkouts" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'program',
    "programKey" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL DEFAULT 1,
    "installmentTotal" INTEGER NOT NULL DEFAULT 1,
    "amountCents" INTEGER NOT NULL,
    "programTotalCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "paymentId" TEXT,
    "secondChargeDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "proposal_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "founderTitle" TEXT NOT NULL DEFAULT 'the vision behind body shaper system™',
    "founderBio" TEXT,
    "founderBioEs" TEXT,
    "activeCampaign" TEXT DEFAULT 'holiday_333',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_proposals_token_key" ON "client_proposals"("token");

-- CreateIndex
CREATE INDEX "client_proposals_status_idx" ON "client_proposals"("status");

-- CreateIndex
CREATE INDEX "client_proposals_clientId_idx" ON "client_proposals"("clientId");

-- CreateIndex
CREATE INDEX "proposal_events_proposalId_createdAt_idx" ON "proposal_events"("proposalId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_checkouts_stripeSessionId_key" ON "proposal_checkouts"("stripeSessionId");

-- CreateIndex
CREATE INDEX "proposal_checkouts_proposalId_idx" ON "proposal_checkouts"("proposalId");

-- AddForeignKey
ALTER TABLE "client_proposals" ADD CONSTRAINT "client_proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_events" ADD CONSTRAINT "proposal_events_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "client_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_checkouts" ADD CONSTRAINT "proposal_checkouts_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "client_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Security: proposal data is only ever read server-side through Prisma.
-- Enable RLS with no policies so the public Supabase anon/authenticated
-- roles (PostgREST) can never read or list proposals, tokens or payments.
ALTER TABLE "client_proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proposal_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proposal_checkouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proposal_settings" ENABLE ROW LEVEL SECURITY;
