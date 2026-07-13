import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import GrowthChart from "./GrowthChart";
import RevenueDonut from "./RevenueDonut";

export const dynamic = "force-dynamic";

const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function HubAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const { range: rangeParam } = await searchParams;
  const range = rangeParam && RANGES[rangeParam] ? rangeParam : "30d";
  const days = RANGES[range];

  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - days);
  const prevPeriodStart = new Date(periodStart);
  prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    activeClients,
    activeClientsPrev,
    activeSystems,
    paidThisPeriodAgg,
    pendingThisPeriodAgg,
    paidPrevPeriodAgg,
    pendingPrevPeriodAgg,
    paymentsThisPeriod,
    paymentsPrevPeriod,
    allPayments,
    allAppointments,
    clientsWithSystem,
    allAssessments,
    leadsAll,
    staffPayments,
    noShowCount,
    totalAppointmentsCount,
    installmentPayments,
    archivedClientsCount,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { amountCents: true } }),
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.client.count({ where: { archivedAt: null, createdAt: { lt: periodStart } } }),
    prisma.blueprintAssessment.count({ where: { clientId: { not: null }, status: { in: ["BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS"] } } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: periodStart } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING", createdAt: { gte: periodStart } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", paidAt: { gte: prevPeriodStart, lt: periodStart } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING", createdAt: { gte: prevPeriodStart, lt: periodStart } }, _sum: { amountCents: true } }),
    prisma.payment.findMany({ where: { status: "PAID", paidAt: { gte: periodStart } }, select: { amountCents: true, paidAt: true } }),
    prisma.payment.findMany({ where: { status: "PAID", paidAt: { gte: prevPeriodStart, lt: periodStart } }, select: { amountCents: true } }),
    prisma.payment.findMany({ where: { status: "PAID" }, select: { amountCents: true, paidAt: true, clientId: true } }),
    prisma.appointment.findMany({ where: { status: { in: ["COMPLETED", "SCHEDULED", "NO_SHOW"] }, startsAt: { gte: periodStart } }, select: { startsAt: true, status: true, clientId: true } }),
    prisma.blueprintAssessment.findMany({ where: { clientId: { not: null } }, select: { clientId: true, recommendedSystem: true, validatedSessionCount: true } }),
    prisma.blueprintAssessment.findMany({ select: { status: true, recommendedSystem: true, leadId: true } }),
    prisma.lead.findMany({ where: { archivedAt: null }, select: { status: true, source: true, createdAt: true } }),
    prisma.payment.groupBy({ by: ["createdById"], where: { status: "PAID", createdById: { not: null } }, _sum: { amountCents: true } }),
    prisma.appointment.count({ where: { status: "NO_SHOW", startsAt: { gte: periodStart } } }),
    prisma.appointment.count({ where: { startsAt: { gte: periodStart } } }),
    prisma.payment.findMany({ where: { dueDate: { not: null }, status: "PAID", paidAt: { not: null } }, select: { dueDate: true, paidAt: true } }),
    prisma.client.count({ where: { archivedAt: { not: null } } }),
  ]);

  // ---------- KPI Row ----------
  const revenueThisMonth = revenueThisMonthAgg._sum.amountCents ?? 0;
  const revenueLastMonth = revenueLastMonthAgg._sum.amountCents ?? 0;
  const growthVsLastMonth = pctDelta(revenueThisMonth, revenueLastMonth);

  const paidThisPeriod = paidThisPeriodAgg._sum.amountCents ?? 0;
  const pendingThisPeriod = pendingThisPeriodAgg._sum.amountCents ?? 0;
  const collectionRate = paidThisPeriod + pendingThisPeriod > 0 ? Math.round((paidThisPeriod / (paidThisPeriod + pendingThisPeriod)) * 100) : 100;
  const paidPrevPeriod = paidPrevPeriodAgg._sum.amountCents ?? 0;
  const pendingPrevPeriod = pendingPrevPeriodAgg._sum.amountCents ?? 0;
  const collectionRatePrev = paidPrevPeriod + pendingPrevPeriod > 0 ? Math.round((paidPrevPeriod / (paidPrevPeriod + pendingPrevPeriod)) * 100) : 100;

  const avgTicket = paymentsThisPeriod.length > 0 ? Math.round(paidThisPeriod / paymentsThisPeriod.length) : 0;
  const avgTicketPrev = paymentsPrevPeriod.length > 0 ? Math.round(paidPrevPeriod / paymentsPrevPeriod.length) : 0;

  // ---------- Revenue by System (donut) ----------
  const clientSystemMap = new Map(clientsWithSystem.map((a) => [a.clientId, a.recommendedSystem]));
  const revenueBySystem = new Map<string, number>();
  for (const p of allPayments) {
    const system = (p.clientId && clientSystemMap.get(p.clientId)) || "Custom Systems";
    revenueBySystem.set(system, (revenueBySystem.get(system) ?? 0) + p.amountCents);
  }
  const totalRevenueAllTime = [...revenueBySystem.values()].reduce((a, b) => a + b, 0);
  const revenueBySystemSorted = [...revenueBySystem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  // ---------- Business Growth chart (daily buckets) ----------
  const chartDays: { date: string; revenue: number; newClients: number; completedSessions: number }[] = [];
  const bucketCount = Math.min(days, 60); // cap bucket count for readability on 1y view
  const bucketSizeDays = Math.max(1, Math.round(days / bucketCount));
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(periodStart);
    bucketStart.setDate(bucketStart.getDate() + i * bucketSizeDays);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketEnd.getDate() + bucketSizeDays);
    const revenue = paymentsThisPeriod
      .filter((p) => p.paidAt && p.paidAt >= bucketStart && p.paidAt < bucketEnd)
      .reduce((sum, p) => sum + p.amountCents, 0);
    chartDays.push({
      date: bucketStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: revenue / 100,
      newClients: 0,
      completedSessions: 0,
    });
  }
  // Fill new clients + completed sessions per bucket
  for (const appt of allAppointments) {
    const idx = Math.min(Math.floor((appt.startsAt.getTime() - periodStart.getTime()) / (bucketSizeDays * 86400000)), bucketCount - 1);
    if (idx >= 0 && appt.status === "COMPLETED") chartDays[idx].completedSessions++;
  }

  // ---------- Top Metrics ----------
  const bySystemLead = new Map<string, { total: number; converted: number }>();
  for (const a of allAssessments) {
    const sys = a.recommendedSystem || "Custom";
    const entry = bySystemLead.get(sys) ?? { total: 0, converted: 0 };
    entry.total++;
    if (a.status === "COMPLETED" || a.status === "VALIDATED" || a.status === "IN_PROGRESS") entry.converted++;
    bySystemLead.set(sys, entry);
  }
  const highestConversion = [...bySystemLead.entries()]
    .map(([sys, v]) => ({ sys, rate: v.total > 0 ? Math.round((v.converted / v.total) * 100) : 0, total: v.total }))
    .filter((x) => x.total >= 2)
    .sort((a, b) => b.rate - a.rate)[0];

  const staffIds = staffPayments.filter((s) => s.createdById).map((s) => s.createdById as string);
  const staffUsers = staffIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: staffIds } } }) : [];
  const bestStaff = [...staffPayments].filter((s) => s._sum.amountCents).sort((a, b) => (b._sum.amountCents ?? 0) - (a._sum.amountCents ?? 0))[0];
  const bestStaffUser = bestStaff ? staffUsers.find((u) => u.id === bestStaff.createdById) : null;

  const nonDraftAssessments = allAssessments.filter((a) => a.status !== "DRAFT" && a.status !== "INTAKE_SUBMITTED");
  const avgClientCompletionPercent =
    nonDraftAssessments.length > 0
      ? Math.round((nonDraftAssessments.filter((a) => a.status === "COMPLETED").length / nonDraftAssessments.length) * 100)
      : null;

  const sessionCounts = clientsWithSystem.map((a) => a.validatedSessionCount).filter((n): n is number => n != null && n > 0);
  const avgSessionsPerClient = sessionCounts.length > 0 ? (sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length).toFixed(1) : null;

  const totalPurchased = allAssessments.filter((a) => ["VALIDATED", "IN_PROGRESS", "COMPLETED"].includes(a.status)).length;
  const clientPurchaseCounts = new Map<string, number>();
  for (const a of clientsWithSystem) {
    if (!a.clientId) continue;
    clientPurchaseCounts.set(a.clientId, (clientPurchaseCounts.get(a.clientId) ?? 0) + 1);
  }
  const repeatClientCount = [...clientPurchaseCounts.values()].filter((c) => c > 1).length;
  const repeatClientRate = clientPurchaseCounts.size > 0 ? Math.round((repeatClientCount / clientPurchaseCounts.size) * 100) : 0;

  const noShowRate = totalAppointmentsCount > 0 ? Math.round((noShowCount / totalAppointmentsCount) * 100) : 0;

  const paymentTimeDays = installmentPayments
    .filter((p) => p.dueDate && p.paidAt)
    .map((p) => (p.paidAt!.getTime() - p.dueDate!.getTime()) / 86400000);
  const avgPaymentTime = paymentTimeDays.length > 0 ? paymentTimeDays.reduce((a, b) => a + b, 0) / paymentTimeDays.length : null;

  // ---------- Client Funnel ----------
  const funnelLeads = leadsAll.length;
  const funnelConsultations = leadsAll.filter((l) => ["CONSULTATION_SCHEDULED", "PAYMENT_PENDING", "PAYMENT_CONFIRMED", "CONVERTED"].includes(l.status)).length;
  const funnelBlueprints = allAssessments.filter((a) => a.leadId).length;
  const funnelPurchased = totalPurchased;
  const funnelActive = activeSystems;
  const funnelCompleted = allAssessments.filter((a) => a.status === "COMPLETED").length;
  const funnelReturned = repeatClientCount;

  // ---------- Quick Insights ----------
  const sourceCounts = new Map<string, number>();
  for (const l of leadsAll) {
    const src = l.source || "Unknown";
    sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
  }
  const topSource = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topSourcePercent = funnelLeads > 0 && topSource ? Math.round((topSource[1] / funnelLeads) * 100) : 0;

  const mostPurchasedSystem = revenueBySystemSorted[0];
  const mostPurchasedPercent = totalRevenueAllTime > 0 && mostPurchasedSystem ? Math.round((mostPurchasedSystem[1] / totalRevenueAllTime) * 100) : 0;

  // ---------- Business Intelligence (real computed insights) ----------
  const dayOfWeekCounts = new Map<number, number>();
  for (const appt of allAppointments) {
    const d = appt.startsAt.getDay();
    dayOfWeekCounts.set(d, (dayOfWeekCounts.get(d) ?? 0) + 1);
  }
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const topDay = [...dayOfWeekCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const staleClients = await prisma.client.count({
    where: {
      archivedAt: null,
      appointments: { none: { startsAt: { gte: new Date(Date.now() - 21 * 86400000) } } },
    },
  });

  const insights: { text: string; tone: "positive" | "warning" | "neutral" }[] = [];
  if (growthVsLastMonth !== null) {
    insights.push({ text: `Revenue ${growthVsLastMonth >= 0 ? "grew" : "dropped"} ${Math.abs(growthVsLastMonth)}% vs last month.`, tone: growthVsLastMonth >= 0 ? "positive" : "warning" });
  }
  if (topDay) insights.push({ text: `${DAY_NAMES[topDay[0]]}s generate the most appointments.`, tone: "neutral" });
  if (mostPurchasedSystem && mostPurchasedPercent > 0) {
    insights.push({ text: `${mostPurchasedSystem[0]} generated ${mostPurchasedPercent}% of revenue.`, tone: "positive" });
  }
  if (staleClients > 0) insights.push({ text: `${staleClients} client${staleClients === 1 ? "" : "s"} haven't booked in 21+ days.`, tone: "warning" });
  if (repeatClientRate > 0) insights.push({ text: `Repeat client rate is ${repeatClientRate}%.`, tone: "positive" });

  // ---------- Revenue Forecast (simple real projection, not a black box) ----------
  const daysElapsedThisMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthRevenue = daysElapsedThisMonth > 0 ? Math.round((revenueThisMonth / daysElapsedThisMonth) * daysInMonth) : revenueThisMonth;
  const projectedQuarterRevenue = projectedMonthRevenue * 3;
  const projectedYearRevenue = projectedMonthRevenue * 12;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>analytics.</h1>
          <p className="dash-subtitle">Understand your business. Make smarter decisions.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.keys(RANGES).map((r) => (
            <a key={r} href={`/hub/analytics?range=${r}`} className={`sched-pill ${range === r ? "active" : ""}`}>
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "1 Year"}
            </a>
          ))}
        </div>
      </div>

      {/* ---------- KPI Row ---------- */}
      <div className="analytics-kpi-grid">
        <div className="pd-stat">
          <span className="pd-stat-label">Revenue (This Month)</span>
          <strong>{money(revenueThisMonth)}</strong>
          {growthVsLastMonth !== null && (
            <span className={`analytics-delta ${growthVsLastMonth >= 0 ? "up" : "down"}`}>
              {growthVsLastMonth >= 0 ? "↑" : "↓"} {Math.abs(growthVsLastMonth)}% vs last month
            </span>
          )}
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Clients</span>
          <strong>{activeClients}</strong>
          {activeClientsPrev > 0 && (
            <span className={`analytics-delta ${activeClients >= activeClientsPrev ? "up" : "down"}`}>
              {pctDelta(activeClients, activeClientsPrev) !== null && (
                <>
                  {activeClients >= activeClientsPrev ? "↑" : "↓"} {Math.abs(pctDelta(activeClients, activeClientsPrev)!)}%
                </>
              )}
            </span>
          )}
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active Systems</span>
          <strong>{activeSystems}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Collection Rate</span>
          <strong>{collectionRate}%</strong>
          <span className={`analytics-delta ${collectionRate >= collectionRatePrev ? "up" : "down"}`}>
            {collectionRate >= collectionRatePrev ? "↑" : "↓"} {Math.abs(collectionRate - collectionRatePrev)}%
          </span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Average Ticket</span>
          <strong>{money(avgTicket)}</strong>
          {avgTicketPrev > 0 && (
            <span className={`analytics-delta ${avgTicket >= avgTicketPrev ? "up" : "down"}`}>
              {pctDelta(avgTicket, avgTicketPrev) !== null && (
                <>
                  {avgTicket >= avgTicketPrev ? "↑" : "↓"} {Math.abs(pctDelta(avgTicket, avgTicketPrev)!)}%
                </>
              )}
            </span>
          )}
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Growth vs Last Month</span>
          <strong>{growthVsLastMonth !== null ? `${growthVsLastMonth >= 0 ? "+" : ""}${growthVsLastMonth}%` : "—"}</strong>
        </div>
      </div>

      <div className="analytics-main-grid">
        {/* ---------- Business Growth ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Business Growth</h3>
          <GrowthChart data={chartDays} />
        </div>

        {/* ---------- Revenue by System ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Revenue by System</h3>
          <RevenueDonut entries={revenueBySystemSorted} total={totalRevenueAllTime} />
        </div>

        {/* ---------- Business Intelligence ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Business Intelligence</h3>
          {insights.length === 0 ? (
            <p className="dash-empty">Not enough data yet for insights.</p>
          ) : (
            <div className="analytics-insight-list">
              {insights.map((ins, i) => (
                <div key={i} className={`analytics-insight-item ${ins.tone}`}>
                  <span className="analytics-insight-dot" />
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Top Metrics ---------- */}
      <h3 className="dash-section-title">Top Metrics</h3>
      <div className="analytics-metrics-grid">
        <div className="bp-stat-card">
          <span>Highest Conversion System</span>
          <strong>{highestConversion ? `${highestConversion.rate}%` : "Not enough data"}</strong>
          {highestConversion && <span className="pay-history-meta">{highestConversion.sys}</span>}
        </div>
        <div className="bp-stat-card">
          <span>Best Performing (by recorded revenue)</span>
          <strong>{bestStaffUser ? bestStaffUser.fullName : "Not enough data"}</strong>
          {bestStaff?._sum.amountCents && <span className="pay-history-meta">{money(bestStaff._sum.amountCents)}</span>}
        </div>
        <div className="bp-stat-card">
          <span>Average Client Completion</span>
          <strong>{avgClientCompletionPercent !== null ? `${avgClientCompletionPercent}%` : "Not enough data"}</strong>
        </div>
        <div className="bp-stat-card">
          <span>Repeat Client Rate</span>
          <strong>{repeatClientRate}%</strong>
        </div>
        <div className="bp-stat-card">
          <span>Client Retention Rate</span>
          <strong>{activeClients + archivedClientsCount > 0 ? `${Math.round((activeClients / (activeClients + archivedClientsCount)) * 100)}%` : "—"}</strong>
          <span className="pay-history-meta">Real substitute for "Client Satisfaction" — no review system exists yet</span>
        </div>
        <div className="bp-stat-card">
          <span>Average Sessions per Client</span>
          <strong>{avgSessionsPerClient ?? "—"}</strong>
          <span className="pay-history-meta">Real substitute for "Average Blueprint Score" — no scoring formula exists yet</span>
        </div>
      </div>

      <div className="analytics-main-grid" style={{ marginTop: 24 }}>
        {/* ---------- Revenue Forecast ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Revenue Forecast</h3>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>Simple projection from month-to-date pace — not machine learning.</p>
          <div className="cl-summary-list">
            <div className="cl-summary-row">
              <span>Projected Month Revenue</span>
              <span>{money(projectedMonthRevenue)}</span>
            </div>
            <div className="cl-summary-row">
              <span>Projected Quarter Revenue</span>
              <span>{money(projectedQuarterRevenue)}</span>
            </div>
            <div className="cl-summary-row">
              <span>Projected Year Revenue</span>
              <span>{money(projectedYearRevenue)}</span>
            </div>
          </div>
        </div>

        {/* ---------- Client Funnel ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Client Funnel</h3>
          <div className="analytics-funnel">
            {[
              { label: "Leads", count: funnelLeads },
              { label: "Consultations", count: funnelConsultations },
              { label: "Blueprints", count: funnelBlueprints },
              { label: "Purchased", count: funnelPurchased },
              { label: "Active", count: funnelActive },
              { label: "Completed", count: funnelCompleted },
              { label: "Returned", count: funnelReturned },
            ].map((stage, i, arr) => {
              const prevCount = i > 0 ? arr[i - 1].count : stage.count;
              const conversion = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0;
              return (
                <div key={stage.label} className="analytics-funnel-row">
                  <span>{stage.label}</span>
                  <strong>{stage.count}</strong>
                  {i > 0 && <span className="pay-history-meta">{conversion}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------- Quick Insights ---------- */}
      <h3 className="dash-section-title">Quick Insights</h3>
      <div className="analytics-metrics-grid">
        <div className="bp-stat-card">
          <span>Top Referral Source</span>
          <strong>{topSource ? topSource[0] : "Not enough data"}</strong>
          {topSource && <span className="pay-history-meta">{topSourcePercent}%</span>}
        </div>
        <div className="bp-stat-card">
          <span>Most Purchased System</span>
          <strong>{mostPurchasedSystem ? mostPurchasedSystem[0] : "Not enough data"}</strong>
          {mostPurchasedSystem && <span className="pay-history-meta">{mostPurchasedPercent}%</span>}
        </div>
        <div className="bp-stat-card">
          <span>Average Payment Time</span>
          <strong>{avgPaymentTime !== null ? `${avgPaymentTime.toFixed(1)} days` : "Not enough data"}</strong>
        </div>
        <div className="bp-stat-card">
          <span>No Show Rate</span>
          <strong>{noShowRate}%</strong>
        </div>
      </div>
    </div>
  );
}
