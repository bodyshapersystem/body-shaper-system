import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { CATEGORY_LABELS } from "@/lib/rewards";
import MembersTab from "./MembersTab";
import CatalogTab from "./CatalogTab";
import MissionsTab from "./MissionsTab";
import PartnersTab from "./PartnersTab";
import { RedemptionRow, MissionReviewRow } from "./PendingActionRow";

export const dynamic = "force-dynamic";

export default async function HubRewardsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  const canManage = hasPermission(user, "rewards.manage");
  const { tab } = await searchParams;
  const activeTab = tab ?? "dashboard";

  const [accounts, clients, catalogItems, missions, partners, pendingCompletions, pendingRedemptions] = await Promise.all([
    prisma.rewardsAccount.findMany({
      include: { client: true, transactions: { orderBy: { createdAt: "desc" }, take: 3 } },
      orderBy: { pointsBalance: "desc" },
    }),
    prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } }),
    prisma.rewardCatalogItem.findMany({ orderBy: { creditCost: "asc" } }),
    prisma.mission.findMany({ orderBy: { creditReward: "asc" } }),
    prisma.partner.findMany({ orderBy: { name: "asc" } }),
    prisma.missionCompletion.findMany({ where: { status: "PENDING" }, include: { mission: true, rewardsAccount: { include: { client: true } } } }),
    prisma.rewardRedemption.findMany({ where: { status: "PENDING" }, include: { rewardCatalogItem: true, rewardsAccount: { include: { client: true } } } }),
  ]);

  const totalMembers = accounts.length;
  const totalCreditsIssued = accounts.reduce((sum, a) => sum + a.lifetimePoints, 0);
  const totalCreditsRedeemed = await prisma.rewardRedemption.aggregate({ where: { status: "FULFILLED" }, _sum: { creditsCost: true } });
  const topMembers = [...accounts].sort((a, b) => b.lifetimePoints - a.lifetimePoints).slice(0, 5);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">business</p>
        <h1>rewards™.</h1>
        <p className="dash-subtitle">The Body Shaper System Society™ — manage members, catalog, and missions.</p>
      </div>

      <div className="rw-tabs" style={{ marginBottom: 24 }}>
        <Link href="/hub/rewards?tab=dashboard" className={`rw-tab ${activeTab === "dashboard" ? "rw-tab-active" : ""}`}>Dashboard</Link>
        <Link href="/hub/rewards?tab=members" className={`rw-tab ${activeTab === "members" ? "rw-tab-active" : ""}`}>Members</Link>
        <Link href="/hub/rewards?tab=catalog" className={`rw-tab ${activeTab === "catalog" ? "rw-tab-active" : ""}`}>Catalog</Link>
        <Link href="/hub/rewards?tab=missions" className={`rw-tab ${activeTab === "missions" ? "rw-tab-active" : ""}`}>Missions</Link>
        <Link href="/hub/rewards?tab=partners" className={`rw-tab ${activeTab === "partners" ? "rw-tab-active" : ""}`}>Partners</Link>
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="doc-card-grid" style={{ marginBottom: 28 }}>
            <div className="pd-stat"><span className="pd-stat-label">Total Members</span><strong>{totalMembers}</strong></div>
            <div className="pd-stat"><span className="pd-stat-label">Total Society Points Issued</span><strong>{totalCreditsIssued.toLocaleString()}</strong></div>
            <div className="pd-stat"><span className="pd-stat-label">Society Points Redeemed</span><strong>{(totalCreditsRedeemed._sum.creditsCost ?? 0).toLocaleString()}</strong></div>
            <div className="pd-stat"><span className="pd-stat-label">Pending Redemptions</span><strong>{pendingRedemptions.length}</strong></div>
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
              <Link key={m.id} href={`/hub/rewards?tab=members&clientId=${m.clientId}`} className="doc-client-card">
                <div className="cl-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{m.client.firstName[0]}{m.client.lastName[0]}</div>
                <div>
                  <p className="doc-card-title">{m.client.firstName} {m.client.lastName}</p>
                  <p className="pay-history-meta">{m.tier} · {m.lifetimePoints.toLocaleString()} lifetime Society Points</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {activeTab === "members" && <MembersTab accounts={accounts} canManage={canManage} />}
      {activeTab === "catalog" && <CatalogTab items={catalogItems} canManage={canManage} categoryLabels={CATEGORY_LABELS} />}
      {activeTab === "missions" && <MissionsTab missions={missions} canManage={canManage} />}
      {activeTab === "partners" && <PartnersTab partners={partners} canManage={canManage} />}
    </div>
  );
}
