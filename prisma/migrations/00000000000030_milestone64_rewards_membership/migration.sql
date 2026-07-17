-- Milestone 64: Body Rewards™ real membership program — catalog,
-- redemptions, missions, partners.

ALTER TABLE "rewards_accounts" ADD COLUMN "lifetimePoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "rewards_accounts" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "RewardCategory" AS ENUM ('BEAUTY', 'WELLNESS', 'EXPERIENCES', 'HOLISTIC', 'VIP', 'PARTNER', 'MOMS', 'FOOD');

CREATE TABLE "reward_catalog_items" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" "RewardCategory" NOT NULL,
  "creditCost" INTEGER NOT NULL,
  "imageStoragePath" TEXT,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reward_catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED');

CREATE TABLE "reward_redemptions" (
  "id" TEXT NOT NULL,
  "rewardsAccountId" TEXT NOT NULL,
  "rewardCatalogItemId" TEXT NOT NULL,
  "creditsCost" INTEGER NOT NULL,
  "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fulfilledAt" TIMESTAMP(3),
  CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardsAccountId_fkey"
  FOREIGN KEY ("rewardsAccountId") REFERENCES "rewards_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardCatalogItemId_fkey"
  FOREIGN KEY ("rewardCatalogItemId") REFERENCES "reward_catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TYPE "MissionType" AS ENUM ('SELF_REPORT', 'MANUAL_APPROVAL');

CREATE TABLE "missions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "creditReward" INTEGER NOT NULL,
  "type" "MissionType" NOT NULL DEFAULT 'SELF_REPORT',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "CompletionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "mission_completions" (
  "id" TEXT NOT NULL,
  "rewardsAccountId" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "status" "CompletionStatus" NOT NULL DEFAULT 'PENDING',
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "mission_completions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "mission_completions" ADD CONSTRAINT "mission_completions_rewardsAccountId_fkey"
  FOREIGN KEY ("rewardsAccountId") REFERENCES "rewards_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mission_completions" ADD CONSTRAINT "mission_completions_missionId_fkey"
  FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "partners" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "creditValue" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);
