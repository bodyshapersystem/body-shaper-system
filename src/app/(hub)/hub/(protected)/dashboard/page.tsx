import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import { getPhotoSignedUrl } from "../clients/[id]/blueprint-actions";
import Link from "next/link";
import BlueprintWaves from "@/components/BlueprintWaves";

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
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

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
    revenueThisMonthAgg,
    totalLeadsAllTime,
    convertedLeadsAllTime,
    clientsMissingDocs,
    weightHistory,
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
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amountCents: true } }),
    prisma.lead.count({ where: { archivedAt: null } }),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.client.findMany({
      where: {
        archivedAt: null,
        documents: { none: { category: { in: ["WELCOME_GUIDE", "POLICIES_APPOINTMENTS", "CONSENT_TREATMENT"] } } },
      },
      select: { id: true },
    }),
    prisma.measurement.findMany({
      where: { weightKg: { not: null } },
      select: { clientId: true, weightKg: true, scanDate: true },
      orderBy: { scanDate: "asc" },
    }),
  ]);

  // ---------- Transformation Spotlight: real, or honest empty state ----------
  const weightByClient = new Map<string, { first: number; last: number; firstDate: Date; lastDate: Date }>();
  for (const m of weightHistory) {
    if (!m.clientId || m.weightKg == null) continue;
    const entry = weightByClient.get(m.clientId);
    if (!entry) {
      weightByClient.set(m.clientId, { first: m.weightKg, last: m.weightKg, firstDate: m.scanDate, lastDate: m.scanDate });
    } else {
      entry.last = m.weightKg;
      entry.lastDate = m.scanDate;
    }
  }
  const biggestLoss = [...weightByClient.entries()]
    .map(([clientId, w]) => ({ clientId, lossKg: w.first - w.last, ...w }))
    .filter((w) => w.lossKg > 0)
    .sort((a, b) => b.lossKg - a.lossKg)[0];

  let spotlight: {
    clientName: string;
    system: string | null;
    weeks: number;
    lossLbs: number;
    beforeUrl: string | null;
    afterUrl: string | null;
  } | null = null;

  if (biggestLoss) {
    const [client, photos] = await Promise.all([
      prisma.client.findUnique({
        where: { id: biggestLoss.clientId },
        include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } },
      }),
      prisma.photo.findMany({ where: { clientId: biggestLoss.clientId }, orderBy: { uploadedAt: "asc" } }),
    ]);
    if (client && photos.length >= 2) {
      const before = photos[0];
      const after = photos[photos.length - 1];
      const [beforeUrl, afterUrl] = await Promise.all([getPhotoSignedUrl(before.storagePath), getPhotoSignedUrl(after.storagePath)]);
      const weeks = Math.max(1, Math.round((biggestLoss.lastDate.getTime() - biggestLoss.firstDate.getTime()) / (7 * 86400000)));
      spotlight = {
        clientName: `${client.firstName} ${client.lastName[0]}.`,
        system: client.blueprintAssessments[0]?.recommendedSystem ?? null,
        weeks,
        lossLbs: Math.round(biggestLoss.lossKg * 2.20462 * 10) / 10,
        beforeUrl,
        afterUrl,
      };
    }
  }

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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const revenueThisMonth = revenueThisMonthAgg._sum.amountCents ?? 0;
  const conversionRate = totalLeadsAllTime > 0 ? Math.round((convertedLeadsAllTime / totalLeadsAllTime) * 100) : 0;

  return (
    <div className="cat-body portal-page dash-root">
      {/* ---------- Hero ---------- */}
      <div className="dash-hero">
        <BlueprintWaves className="dash-hero-waves" />
        <div className="dash-hero-left">
          <p className="portal-eyebrow">owner hub</p>
          <h1 className="dash-hero-title">
            {greeting},<br />
            {firstName}.
          </h1>
          <p className="dash-hero-sub">Today's Business</p>
          <div className="dash-hero-kpis">
            <div className="dash-hero-kpi">
              <strong>{todaysAppointments.length}</strong>
              <span>Appointments</span>
            </div>
            <div className="dash-hero-kpi">
              <strong>{newLeadsToday}</strong>
              <span>New Leads</span>
            </div>
            <div className="dash-hero-kpi">
              <strong>{clientsMissingDocs.length}</strong>
              <span>Pending Documents</span>
            </div>
            <div className="dash-hero-kpi">
              <strong>{money(pendingPayments._sum.amountCents)}</strong>
              <span>Pending Payments</span>
            </div>
          </div>
          <Link href="/hub/appointments" className="dash-hero-cta">
            Open Today →
          </Link>
        </div>

        <div className="dash-hero-right">
          <img src="/images/emmy-hero.jpg" alt={firstName} className="dash-hero-photo" />
        </div>
      </div>

      {/* ---------- Below Hero: editorial panels ---------- */}
      <div className="dash-two-col">
        <div className="pd-card dash-editorial-panel">
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

        <div className="pd-card dash-editorial-panel">
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

      {/* ---------- Transformation Spotlight ---------- */}
      <h3 className="dash-section-title">Transformation Spotlight™</h3>
      {spotlight && spotlight.beforeUrl && spotlight.afterUrl ? (
        <div className="pd-card dash-spotlight">
          <div className="dash-spotlight-photos">
            <div>
              <img src={spotlight.beforeUrl} alt="Before" />
              <span>Before</span>
            </div>
            <div>
              <img src={spotlight.afterUrl} alt="After" />
              <span>After</span>
            </div>
          </div>
          <div className="dash-spotlight-info">
            <p className="bp-hero-eyebrow">{spotlight.clientName}</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 4px" }}>
              {spotlight.system ?? "Custom System"}
            </h2>
            <p className="pay-history-meta" style={{ marginBottom: 16 }}>{spotlight.weeks} Weeks</p>
            <div className="dash-spotlight-stat">
              <strong>-{spotlight.lossLbs} lbs</strong>
              <span>Weight Change</span>
            </div>
            <Link href="/hub/clients" className="pd-link" style={{ marginTop: 12, display: "inline-block" }}>
              View Full Story →
            </Link>
          </div>
        </div>
      ) : (
        <div className="pd-card">
          <p className="dash-empty">No transformation with both before/after photos and weight tracking yet — it will appear here automatically once available.</p>
        </div>
      )}

      {/* ---------- Business Overview ---------- */}
      <h3 className="dash-section-title">Business Overview</h3>
      <div className="pd-stats" style={{ marginBottom: 32 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Revenue (This Month)</span>
          <strong>{money(revenueThisMonth)}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Clients</span>
          <strong>{activeClientsCount}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Today's Appointments</span>
          <strong>{todaysAppointments.length}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Conversion Rate</span>
          <strong>{conversionRate}%</strong>
        </div>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <h3 className="dash-section-title">Quick Actions</h3>
      <div className="dash-quick-tiles">
        <Link href="/hub/leads/new" className="dash-quick-tile">
          <span>+</span>
          New Lead
        </Link>
        <Link href="/hub/clients" className="dash-quick-tile">
          <span>◐</span>
          New Client
        </Link>
        <Link href="/hub/clients" className="dash-quick-tile">
          <span>▤</span>
          Create Blueprint™
        </Link>
        <Link href="/hub/appointments" className="dash-quick-tile">
          <span>◷</span>
          Schedule Session
        </Link>
        <Link href="/hub/payments" className="dash-quick-tile">
          <span>$</span>
          Record Payment
        </Link>
        <Link href="/hub/documents" className="dash-quick-tile">
          <span>⬆</span>
          Upload Documents
        </Link>
        <Link href="/hub/analytics" className="dash-quick-tile">
          <span>◫</span>
          Analytics
        </Link>
      </div>
    </div>
  );
}
