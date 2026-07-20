import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextTierInfo, CATEGORY_LABELS, CATEGORY_ICONS, isEligibleForSignatureExperiences } from "@/lib/rewards";

/**
 * Shared loader for all four /portal/rewards/* routes. Each route
 * fetches the exact same account/catalog/mission/partner data —
 * RewardsView renders different sections depending on which tab is
 * active, so all four pages need the full data set. Centralizing it
 * here means the four page.tsx files stay thin and never drift.
 */
export async function getRewardsPageData() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");
  if (!client.rewardsAccount) return null;

  const [catalogItems, missions, recentTransactions, completions, assessment, partners] = await Promise.all([
    prisma.rewardCatalogItem.findMany({ where: { available: true }, orderBy: { creditCost: "asc" } }),
    prisma.mission.findMany({ where: { active: true }, orderBy: { creditReward: "asc" } }),
    prisma.rewardsTransaction.findMany({ where: { rewardsAccountId: client.rewardsAccount.id }, orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.missionCompletion.findMany({ where: { rewardsAccountId: client.rewardsAccount.id, status: { in: ["PENDING", "APPROVED"] } } }),
    prisma.blueprintAssessment.findFirst({ where: { clientId: client.id }, orderBy: { version: "desc" } }),
    prisma.partner.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const admin = createSupabaseAdminClient();
  const catalogWithUrls = await Promise.all(
    catalogItems.map(async (item) => {
      let imageUrl: string | null = null;
      if (item.imageStoragePath) {
        const { data } = await admin.storage.from("client-documents").createSignedUrl(item.imageStoragePath, 60 * 60);
        imageUrl = data?.signedUrl ?? null;
      }
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        creditCost: item.creditCost,
        imageUrl,
      };
    })
  );

  const { nextTier, creditsToNext } = nextTierInfo(client.rewardsAccount.lifetimePoints);
  const completedMissionIds = new Set(completions.map((c) => c.missionId));
  const eligibleForSignature = await isEligibleForSignatureExperiences(client.id);

  return {
    firstName: client.firstName,
    tier: client.rewardsAccount.tier,
    pointsBalance: client.rewardsAccount.pointsBalance,
    lifetimePoints: client.rewardsAccount.lifetimePoints,
    nextTier,
    creditsToNext,
    currentSystem: assessment?.recommendedSystem ?? null,
    catalogItems: catalogWithUrls,
    missions: missions.map((m) => ({ ...m, alreadyDone: completedMissionIds.has(m.id) })),
    transactions: recentTransactions.map((t) => ({ id: t.id, points: t.points, action: t.action, createdAt: t.createdAt.toISOString() })),
    categoryLabels: CATEGORY_LABELS,
    categoryIcons: CATEGORY_ICONS,
    partners: await Promise.all(
      partners.map(async (p) => {
        let imageUrl: string | null = null;
        if (p.imageStoragePath) {
          const { data } = await admin.storage.from("client-documents").createSignedUrl(p.imageStoragePath, 60 * 60);
          imageUrl = data?.signedUrl ?? null;
        }
        return { id: p.id, name: p.name, category: p.category, creditValue: p.creditValue, notes: p.notes, imageUrl };
      })
    ),
    memberSince: client.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    eligibleForSignature,
  };
}
