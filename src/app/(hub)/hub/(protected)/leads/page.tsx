import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Visual grouping only — the underlying LeadStatus enum (10 values,
// unchanged) is mapped into 6 pipeline columns matching the mockup.
// No status values were renamed or removed; this is purely a display
// grouping over the existing data.
const COLUMNS: { label: string; statuses: string[] }[] = [
  { label: "New Lead", statuses: ["NEW"] },
  { label: "Contacted", statuses: ["CONTACTED", "QUALIFIED"] },
  { label: "Consultation", statuses: ["CONSULTATION_SCHEDULED", "BLUEPRINT_COMPLETED"] },
  { label: "Proposal Sent", statuses: ["PAYMENT_PENDING"] },
  { label: "Won", statuses: ["PAYMENT_CONFIRMED", "CONVERTED"] },
  { label: "Lost", statuses: ["LOST", "ARCHIVED"] },
];

function timeAgo(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function HubLeadsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.view")) {
    redirect("/hub/dashboard");
  }

  const { q } = await searchParams;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalLeads, newThisMonth, consultationScheduled, convertedThisMonth, convertedAllTime] = await Promise.all([
    prisma.lead.count({ where: { archivedAt: null } }),
    prisma.lead.count({ where: { archivedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { status: "CONSULTATION_SCHEDULED" } }),
    prisma.lead.count({ where: { status: "CONVERTED", convertedAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
  ]);

  const conversionRate = totalLeads > 0 ? ((convertedAllTime / totalLeads) * 100).toFixed(0) : "0";

  const leads = await prisma.lead.findMany({
    where: {
      archivedAt: null,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q, mode: "insensitive" as const } },
              { source: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // Real "avg response time": average gap between a lead's creation
  // and its first recorded status change (first contact). Only
  // computed over leads that actually have a status history entry —
  // never fabricated for leads with none.
  const firstResponses = await prisma.leadStatusHistory.groupBy({
    by: ["leadId"],
    _min: { changedAt: true },
  });
  let avgResponseLabel: string | null = null;
  if (firstResponses.length > 0) {
    const leadCreatedMap = new Map(leads.map((l) => [l.id, l.createdAt]));
    const gaps: number[] = [];
    for (const r of firstResponses) {
      const created = leadCreatedMap.get(r.leadId);
      if (created && r._min.changedAt) gaps.push(r._min.changedAt.getTime() - created.getTime());
    }
    if (gaps.length > 0) {
      const avgMs = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const avgMins = Math.round(avgMs / 60000);
      avgResponseLabel = avgMins < 60 ? `${avgMins}m` : `${Math.floor(avgMins / 60)}h ${avgMins % 60}m`;
    }
  }

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">lead management</p>
        <h1>leads.</h1>
        <p className="dash-subtitle">Every transformation begins with a conversation.</p>
      </div>

      <div className="pd-stats" style={{ marginBottom: 32 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Leads</span>
          <strong>{totalLeads}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">New This Month</span>
          <strong>{newThisMonth}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Consultation Scheduled</span>
          <strong>{consultationScheduled}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Converted This Month</span>
          <strong>{convertedThisMonth}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Conversion Rate</span>
          <strong>{conversionRate}%</strong>
        </div>
      </div>

      <form style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <input name="q" defaultValue={q ?? ""} placeholder="Search leads…" className="sched-select" style={{ flex: 1, minWidth: 200 }} />
        <button type="submit" className="dash-view-btn">
          Search
        </button>
        {hasPermission(user, "leads.create") && (
          <Link href="/hub/leads/new" className="sched-cta" style={{ textDecoration: "none", padding: "10px 20px" }}>
            + Add Lead
          </Link>
        )}
      </form>

      <div className="lead-board">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => col.statuses.includes(l.status));
          return (
            <div key={col.label} className="lead-column">
              <div className="lead-column-head">
                <span>{col.label.toUpperCase()}</span>
                <span className="lead-column-count">{colLeads.length}</span>
              </div>
              <div className="lead-column-body">
                {colLeads.length === 0 ? (
                  <p className="dash-empty" style={{ fontSize: 12 }}>
                    No leads here.
                  </p>
                ) : (
                  colLeads.map((lead) => (
                    <Link key={lead.id} href={`/hub/leads/${lead.id}`} className="lead-card">
                      <strong>
                        {lead.firstName} {lead.lastName}
                      </strong>
                      <span className="lead-card-source">{lead.source ?? "—"}</span>
                      <span className="lead-card-time">{timeAgo(lead.createdAt)}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pd-stats" style={{ marginTop: 32, gridTemplateColumns: avgResponseLabel ? "repeat(2,1fr)" : "1fr" }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Active Leads</span>
          <strong>{totalLeads}</strong>
        </div>
        {avgResponseLabel && (
          <div className="pd-stat">
            <span className="pd-stat-label">Avg. Response Time</span>
            <strong>{avgResponseLabel}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
