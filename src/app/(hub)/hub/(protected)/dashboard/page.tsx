import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubDashboardPage() {
  const user = await getCurrentHubUser();

  // Milestone 1 scope: only Leads exist as a real module so far, so
  // the dashboard only surfaces what's actually backed by data.
  // Appointments/Payments/Messages widgets get added in the
  // milestones that build those modules — no placeholder numbers.
  const [newLeadsCount, totalLeadsCount] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.lead.count({ where: { archivedAt: null } }),
  ]);

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
          <span className="pd-stat-sub">Not archived</span>
        </div>
      </div>

      <p style={{ marginTop: 32, opacity: 0.6, fontSize: 13 }}>
        Appointments, Payments, and Messages widgets will appear here once those modules are
        built in later milestones.
      </p>
    </div>
  );
}
