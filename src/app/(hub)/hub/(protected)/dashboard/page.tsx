import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import Link from "next/link";

export const dynamic = "force-dynamic";

function money(cents: number | null) {
  return `$${(((cents ?? 0) as number) / 100).toFixed(2)}`;
}

export default async function HubDashboardPage() {
  const user = await getCurrentHubUser();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    newLeadsCount,
    totalLeadsCount,
    activeClientsCount,
    appointmentsTodayCount,
    pendingPayments,
    assessmentsCreatedCount,
    recentLeads,
    recentClients,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.lead.count({ where: { archivedAt: null } }),
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.appointment.count({
      where: { startsAt: { gte: startOfToday, lt: endOfToday }, status: "SCHEDULED" },
    }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountCents: true } }),
    prisma.blueprintAssessment.count({ where: { clientId: { not: null } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const activity = [
    ...recentLeads.map((l) => ({ at: l.createdAt, text: `New lead: ${l.firstName} ${l.lastName}` })),
    ...recentClients.map((c) => ({ at: c.createdAt, text: `Client activated: ${c.firstName} ${c.lastName}` })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Welcome back, {user?.fullName ?? ""}</p>
        <h1>the hub.</h1>
      </div>

      <div className="pd-stats">
        <div className="pd-stat">
          <span className="pd-stat-label">New Leads</span>
          <strong>{newLeadsCount}</strong>
          <span className="pd-stat-sub">Awaiting review</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Active Leads</span>
          <strong>{totalLeadsCount}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Clients</span>
          <strong>{activeClientsCount}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Appointments Today</span>
          <strong>{appointmentsTodayCount}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Pending Payments</span>
          <strong>{money(pendingPayments._sum.amountCents)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Blueprints Created</span>
          <strong>{assessmentsCreatedCount}</strong>
        </div>
      </div>

      <h3 style={{ fontSize: 14, marginTop: 36, marginBottom: 12 }}>Recent Activity</h3>
      {activity.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No activity yet.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, listStyle: "none", paddingLeft: 0 }}>
          {activity.map((a, i) => (
            <li key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 8 }}>
              {a.at.toLocaleString()} — {a.text}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 28 }}>
        <Link href="/hub/leads">View Leads →</Link>
      </p>
    </div>
  );
}
