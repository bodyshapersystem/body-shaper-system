import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { CATEGORY_LABELS } from "@/lib/rewards";
import CatalogTab from "../CatalogTab";
import PartnersTab from "../PartnersTab";

export const dynamic = "force-dynamic";

/**
 * /hub/rewards/experiences — RewardsExperiencesPage
 *
 * Renders only: Body Shaper System Experiences (reward catalog —
 * creation/editing/redemption) and Beauty Partners. Does not render
 * the Overview dashboard or Secret Missions management here.
 */
export default async function RewardsExperiencesPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "rewards.manage");

  const [catalogItems, partners] = await Promise.all([
    prisma.rewardCatalogItem.findMany({ orderBy: { creditCost: "asc" } }),
    prisma.partner.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>unlock experiences.</h1>
        <p className="dash-subtitle">Signature Experiences, catalog items, and Beauty Partners clients can redeem points for.</p>
      </div>

      <h3 className="dash-section-title">Body Shaper System Experiences</h3>
      <CatalogTab items={catalogItems} canManage={canManage} categoryLabels={CATEGORY_LABELS} />

      <h3 className="dash-section-title" style={{ marginTop: 32 }}>Beauty Partners</h3>
      <PartnersTab partners={partners} canManage={canManage} />
    </div>
  );
}
