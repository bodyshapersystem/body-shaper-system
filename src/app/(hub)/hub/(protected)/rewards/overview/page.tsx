import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import { RedemptionRow, MissionReviewRow } from "../PendingActionRow";

export const dynamic = "force-dynamic";

/**
 * /hub/rewards/overview — RewardsOverviewPage
 *
 * Renders only: KPIs, pending actions (redemptions + mission reviews),
 * and a top-members snapshot. Does not render the catalog, missions
 * management, partners, or member/privilege management — those live
 * in their own routes (experiences / missions / privileges).
 */
export default async function RewardsOverviewPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const [accounts, pendingCompletions, pendingRedemptions, redeemedAgg] = await Promise.all([
    prisma.rewardsAccount.findMany({
      include: { client: true, transactions: { orderBy: { createdAt: "desc" }, take: 3 } },
      orderBy: { pointsBalance: "desc" },
    }),
    prisma.missionCompletion.findMany({ where: { status: "PENDING" }, include: { mission: true, rewardsAccount: { include: { client: true } } } }),
    prisma.rewardRedemption.findMany({ where: { status: "PENDING" }, include: { rewardCatalogItem: true, rewardsAccount: { include: { client: true } } } }),
    prisma.rewardRedemption.aggregate({ where: { status: "FULFILLED" }, _sum: { creditsCost: true } }),
  ]);

  const totalMembers = accounts.length;
  const totalCreditsIssued = accounts.reduce((sum, a) => sum + a.lifetimePoints, 0);
  const topMembers = [...accounts].sort((a, b) => b.lifetimePoints - a.lifetimePoints).slice(0, 5);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>rewards™.</h1>
        <p className="dash-subtitle">The Body Shaper System Society™ — overview, engagement snapshot, and pending actions.</p>
      </div>

      <div className="doc-card-grid" style={{ marginBottom: 28 }}>
        <div className="pd-stat"><span className="pd-stat-label">Total Members</span><strong>{totalMembers}</strong></div>
        <div className="pd-stat"><span className="pd-stat-label">Total Society Points Issued</span><strong>{totalCreditsIssued.toLocaleString()}</strong></div>
        <div className="pd-stat"><span className="pd-stat-label">Society Points Redeemed</span><strong>{(redeemedAgg._sum.creditsCost ?? 0).toLocaleString()}</strong></div>
        <div className="pd-stat"><span className="pd-stat-label">Pending Redemptions</span><strong>{pendingRedemptions.length}</strong></div>
      </div>

      <h3 className="dash-section-title">Quick Actions</h3>
      <div className="rw-tabs" style={{ marginBottom: 28 }}>
        <Link href="/hub/rewards/experiences" className="rw-tab">Manage Experiences &amp; Partners</Link>
        <Link href="/hub/rewards/missions" className="rw-tab">Review Missions</Link>
        <Link href="/hub/rewards/privileges" className="rw-tab">Manage Members &amp; Privileges</Link>
      </div>

      {pendingRedemptions.length > 0 && (
        <>
          <h3 className="dash-section-title">Pending Redemptions</h3>
          <div className="cap-list" style={{ marginBottom: 28 }}>
            {pendingRedemptions.map((r) => (
              <RedemptionRow
                key={r.id}
                id={r.id}
                clientName={`${r.rewardsAccount.client.firstName} ${r.rewardsAccount.client.lastName}`}
                itemName={r.rewardCatalogItem.name}
                creditsCost={r.creditsCost}
              />
            ))}
          </div>
        </>
      )}

      {pendingCompletions.length > 0 && (
        <>
          <h3 className="dash-section-title">Pending Mission Reviews</h3>
          <div className="cap-list" style={{ marginBottom: 28 }}>
            {pendingCompletions.map((c) => (
              <MissionReviewRow
                key={c.id}
                id={c.id}
                clientName={`${c.rewardsAccount.client.firstName} ${c.rewardsAccount.client.lastName}`}
                missionName={c.mission.name}
                creditReward={c.mission.creditReward}
              />
            ))}
          </div>
        </>
      )}

      <h3 className="dash-section-title">Top Members</h3>
      <div className="doc-card-grid">
        {topMembers.map((m) => (
          <Link key={m.id} href="/hub/rewards/privileges" className="doc-client-card">
            <div className="cl-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{m.client.firstName[0]}{m.client.lastName[0]}</div>
            <div>
              <p className="doc-card-title">{m.client.firstName} {m.client.lastName}</p>
              <p className="pay-history-meta">{m.tier} · {m.lifetimePoints.toLocaleString()} lifetime Society Points</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
