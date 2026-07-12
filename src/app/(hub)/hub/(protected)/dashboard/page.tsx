import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import Link from "next/link";

export const dynamic = "force-dynamic";

function money(cents: number | null | undefined) {
  return `$${(((cents ?? 0) as number) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default async function HubDashboardPage() {
  const user = await getCurrentHubUser();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    todaysAppointments,
    pendingPayments,
    newLeadsCount,
    newLeadsToday,
    activeClientsCount,
    blueprintsWaitingReview,
    recentLeads,
    recentClients,
    recentPayments,
    recentAppointmentsCompleted,
    recentRewards,
    recentValidatedAssessments,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: startOfToday, lt: endOfToday }, status: { not: "CANCELLED" } },
      include: {
        client: {
          include: {
            blueprintAssessments: {
              where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
              orderBy: { version: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amountCents: true }, _count: true }),
    prisma.lead.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.lead.count({ where: { status: "NEW", archivedAt: null, createdAt: { gte: startOfToday } } }),
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.blueprintAssessment.count({ where: { status: "BASELINE_COMPLETED" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.payment.findMany({ where: { status: "PAID" }, include: { client: true }, orderBy: { paidAt: "desc" }, take: 5 }),
    prisma.appointment.findMany({ where: { status: "COMPLETED" }, include: { client: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.rewardsTransaction.findMany({ include: { rewardsAccount: { include: { client: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.blueprintAssessment.findMany({ where: { status: "VALIDATED" }, include: { client: true }, orderBy: { validatedAt: "desc" }, take: 5 }),
  ]);

  const activity = [
    ...recentLeads.map((l) => ({ at: l.createdAt, text: `${l.firstName} ${l.lastName} submitted a new lead` })),
    ...recentClients.map((c) => ({ at: c.createdAt, text: `${c.firstName} ${c.lastName} was activated as a client` })),
    ...recentPayments.map((p) => ({ at: p.paidAt ?? p.createdAt, text: `Payment of ${money(p.amountCents)} received from ${p.client.firstName} ${p.client.lastName}` })),
    ...recentAppointmentsCompleted.map((a) => ({ at: a.updatedAt, text: `${a.client.firstName} ${a.client.lastName} completed "${a.title}"` })),
    ...recentRewards.filter((r) => r.rewardsAccount.client).map((r) => ({ at: r.createdAt, text: `${r.rewardsAccount.client!.firstName} ${r.rewardsAccount.client!.lastName} earned ${r.points} points — ${r.action}` })),
    ...recentValidatedAssessments.filter((a) => a.client && a.validatedAt).map((a) => ({ at: a.validatedAt as Date, text: `${a.client!.firstName} ${a.client!.lastName}'s Body Blueprint™ was validated` })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const firstName = (user?.fullName ?? "").split(" ")[0] || "there";

  return (
    <div className="cat-body portal-page dash-root">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Dashboard</p>
        <h1>Welcome back, {firstName}.</h1>
        <p className="dash-subtitle">Today is focused on transformation.</p>
      </div>

      {/* ---------- KPI Cards (reusing the existing .pd-stat design system) ---------- */}
      <div className="pd-stats">
        <div className="pd-stat">
          <span className="pd-stat-label">Today's Appointments</span>
          <strong>{todaysAppointments.length}</strong>
          <span className="pd-stat-sub">{todaysAppointments.length === 0 ? "Nothing scheduled" : `${todaysAppointments.filter((a) => a.status === "SCHEDULED").length} scheduled`}</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Pending Payments</span>
          <strong>{money(pendingPayments._sum.amountCents)}</strong>
          <span className="pd-stat-sub">{pendingPayments._count} outstanding</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">New Leads</span>
          <strong>{newLeadsCount}</strong>
          <span className="pd-stat-sub">+{newLeadsToday} today</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Clients</span>
          <strong>{activeClientsCount}</strong>
        </div>
      </div>

      <div className="dash-two-col">
        {/* ---------- Today's Schedule ---------- */}
        <div className="pd-card">
          <div className="dash-card-head">
            <h3>Today's Schedule</h3>
            <Link href="/hub/appointments" className="pd-link">
              View calendar
            </Link>
          </div>
          {todaysAppointments.length === 0 ? (
            <p className="dash-empty">No appointments scheduled today.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client</th>
                  <th>System</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.map((a) => {
                  const system = a.client.blueprintAssessments[0]?.recommendedSystem;
                  return (
                    <tr key={a.id}>
                      <td>{a.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
                      <td>
                        {a.client.firstName} {a.client.lastName}
                      </td>
                      <td>{system ?? "—"}</td>
                      <td>
                        <span className={`dash-status dash-status-${a.status.toLowerCase()}`}>{a.status}</span>
                      </td>
                      <td>
                        <Link href={`/hub/clients/${a.clientId}`} className="dash-view-btn">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ---------- Recent Activity ---------- */}
        <div className="pd-card">
          <div className="dash-card-head">
            <h3>Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p className="dash-empty">No activity yet — it will appear here as leads, clients, and payments come in.</p>
          ) : (
            <ul className="dash-timeline">
              {activity.map((a, i) => (
                <li key={i}>
                  <span className="dash-timeline-dot" aria-hidden="true" />
                  <span className="dash-timeline-text">{a.text}</span>
                  <span className="dash-timeline-time">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---------- Pending Actions ---------- */}
      <h3 className="dash-section-title">Pending Actions</h3>
      <div className="dash-pending-grid">
        <Link href="/hub/payments" className="dash-pending-card">
          <strong>{pendingPayments._count}</strong>
          <span>Pending Payments</span>
        </Link>
        <Link href="/hub/blueprints" className="dash-pending-card">
          <strong>{blueprintsWaitingReview}</strong>
          <span>Body Blueprints waiting review</span>
        </Link>
        <Link href="/hub/appointments" className="dash-pending-card">
          <strong>{todaysAppointments.length}</strong>
          <span>Today's appointments</span>
        </Link>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <h3 className="dash-section-title">Quick Actions</h3>
      <div className="dash-quick-actions">
        <Link href="/hub/leads" className="dash-quick-btn">
          + New Lead
        </Link>
        <Link href="/hub/leads" className="dash-quick-btn">
          + New Client
        </Link>
        <Link href="/hub/appointments" className="dash-quick-btn">
          + Appointment
        </Link>
        <Link href="/hub/blueprints" className="dash-quick-btn">
          + Body Blueprint
        </Link>
      </div>
    </div>
  );
}
