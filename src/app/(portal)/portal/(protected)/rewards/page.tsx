import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextTierInfo, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/rewards";
import RewardsView from "./RewardsView";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");
  if (!client.rewardsAccount) {
    return (
      <div className="cat-body portal-page">
        <div className="module-empty">Your Rewards account is being set up — check back soon.</div>
      </div>
    );
  }

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

  return (
    <div className="cat-body portal-page">
      <RewardsView
        firstName={client.firstName}
        tier={client.rewardsAccount.tier}
        pointsBalance={client.rewardsAccount.pointsBalance}
        lifetimePoints={client.rewardsAccount.lifetimePoints}
        nextTier={nextTier}
        creditsToNext={creditsToNext}
        currentSystem={assessment?.recommendedSystem ?? null}
        catalogItems={catalogWithUrls}
        missions={missions.map((m) => ({ ...m, alreadyDone: completedMissionIds.has(m.id) }))}
        transactions={recentTransactions.map((t) => ({ id: t.id, points: t.points, action: t.action, createdAt: t.createdAt.toISOString() }))}
        categoryLabels={CATEGORY_LABELS}
        categoryIcons={CATEGORY_ICONS}
        partners={partners.map((p) => ({ id: p.id, name: p.name, category: p.category, creditValue: p.creditValue, notes: p.notes }))}
      />
    </div>
  );
}
