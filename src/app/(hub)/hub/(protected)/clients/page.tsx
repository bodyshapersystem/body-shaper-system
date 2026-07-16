import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { computeJourneyStatus } from "@/lib/journey-status";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function HubClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.view")) {
    redirect("/hub/dashboard");
  }
  const timezone = await getBusinessTimezone();

  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalClients, activePlans, newThisMonth, revenueAgg] = await Promise.all([
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.blueprintAssessment.count({
      where: { clientId: { not: null }, status: { in: ["BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS"] } },
    }),
    prisma.client.count({ where: { archivedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
  ]);

  const where = {
    archivedAt: null,
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [clients, totalMatching] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        blueprintAssessments: {
          where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
          orderBy: { version: "desc" },
          take: 1,
        },
        user: { select: { portalStatus: true } },
        documents: { where: { category: "CONSENT_TREATMENT" } },
        rewardsAccount: true,
      },
    }),
    prisma.client.count({ where }),
  ]);

  const rows = await Promise.all(
    clients.map(async (c) => {
      const assessment = c.blueprintAssessments[0];
      const [completedCount, paidAgg, pendingAgg, nextAppt] = await Promise.all([
        prisma.appointment.count({ where: { clientId: c.id, status: "COMPLETED" } }),
        prisma.payment.aggregate({ where: { clientId: c.id, status: "PAID" }, _sum: { amountCents: true } }),
        prisma.payment.aggregate({ where: { clientId: c.id, status: "PENDING" }, _sum: { amountCents: true } }),
        prisma.appointment.findFirst({ where: { clientId: c.id, status: "SCHEDULED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
      ]);

      const totalSessions = assessment?.validatedSessionCount ?? null;
      const derivedStatus = c.pausedAt ? "Paused" : assessment?.status === "COMPLETED" ? "Completed" : "Active";
      const planTotalCents = assessment?.planTotalCents ?? null;
      const paidCents = paidAgg._sum.amountCents ?? 0;
      const balanceCents = planTotalCents !== null ? Math.max(planTotalCents - paidCents, 0) : pendingAgg._sum.amountCents ?? 0;
      const journey = computeJourneyStatus({
        portalActive: c.user?.portalStatus === "ACTIVE",
        hasWaiver: c.documents.length > 0,
        assessmentValidated: !!assessment && assessment.status !== "BASELINE_PENDING" && assessment.status !== "BASELINE_COMPLETED",
        hasCompletedAppointment: completedCount > 0,
        tier: c.rewardsAccount?.tier ?? "Standard",
      });

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        system: assessment?.recommendedSystem ?? "Not set",
        totalSessions,
        completedCount,
        journeyStatus: journey.status,
        journeyIcon: journey.icon,
        clientType: c.clientType,
        progressPercent: totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null,
        balanceCents,
        nextAppt,
        status: derivedStatus,
      };
    })
  );

  const filteredRows = status ? rows.filter((r) => r.status.toLowerCase() === status.toLowerCase()) : rows;
  const totalPages = Math.max(Math.ceil(totalMatching / PAGE_SIZE), 1);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="portal-eyebrow">client management</p>
          <h1>clients.</h1>
          <p className="dash-subtitle">Manage your active clients and their journey.</p>
        </div>
        <Link href="/hub/clients/import" className="dash-view-btn">+ Import Clients</Link>
      </div>

      <div className="pd-stats" style={{ marginBottom: 32 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Clients</span>
          <strong>{totalClients}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Plans</span>
          <strong>{activePlans}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">This Month</span>
          <strong>{newThisMonth}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Total Revenue</span>
          <strong>{money(revenueAgg._sum.amountCents ?? 0)}</strong>
        </div>
      </div>

      <form style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input name="q" defaultValue={q ?? ""} placeholder="Search clients…" className="sched-select" style={{ flex: 1, minWidth: 200 }} />
        <button type="submit" className="dash-view-btn">
          Search
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["Active", "Paused", "Completed"].map((s) => (
          <Link
            key={s}
            href={`/hub/clients?status=${status === s ? "" : s}${q ? `&q=${q}` : ""}`}
            className={`sched-pill ${status === s ? "active" : ""}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <p className="dash-empty">No clients match this view yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Client</th>
              <th style={{ padding: "10px 8px" }}>Status</th>
              <th style={{ padding: "10px 8px" }}>Journey Status</th>
              <th style={{ padding: "10px 8px" }}>Plan</th>
              <th style={{ padding: "10px 8px" }}>Progress</th>
              <th style={{ padding: "10px 8px" }}>Balance</th>
              <th style={{ padding: "10px 8px" }}>Next Appointment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${r.id}`}>{r.name}</Link>
                  <div className="pay-history-meta">{r.email}</div>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <span className={`dash-status dash-status-${r.status.toLowerCase()}`}>{r.status}</span>
                  {r.clientType === "VIP" && <span className="dash-status" style={{ marginLeft: 4 }}>⭐</span>}
                  {r.clientType === "AMBASSADOR" && <span className="dash-status" style={{ marginLeft: 4 }}>🤍</span>}
                </td>
                <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                  {r.journeyIcon} {r.journeyStatus}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {r.system}
                  <div className="pay-history-meta">{r.totalSessions !== null ? `${r.totalSessions} sessions` : "Plan not set"}</div>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {r.totalSessions !== null ? `${r.completedCount} of ${r.totalSessions} · ${r.progressPercent}%` : `${r.completedCount} completed`}
                </td>
                <td style={{ padding: "10px 8px" }}>{r.balanceCents > 0 ? money(r.balanceCents) : "$0.00"}</td>
                <td style={{ padding: "10px 8px" }}>
                  {r.nextAppt
                    ? `${formatDateInTimezone(r.nextAppt.startsAt, timezone)} · ${formatTimeInTimezone(r.nextAppt.startsAt, timezone)}`
                    : "No upcoming"}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${r.id}`} className="dash-view-btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/hub/clients?page=${p}${q ? `&q=${q}` : ""}${status ? `&status=${status}` : ""}`}
              className={`sched-pill ${page === p ? "active" : ""}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
