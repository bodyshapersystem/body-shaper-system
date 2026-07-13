import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import { getPhotoSignedUrl } from "../clients/[id]/blueprint-actions";
import GrowthChart from "../analytics/GrowthChart";
import RevenueDonut from "../analytics/RevenueDonut";

export const dynamic = "force-dynamic";

const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export default async function HubProgressPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
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

  const [
    clientsInProgress,
    clientsInProgressPrev,
    sessionsCompleted,
    sessionsCompletedPrev,
    activeAssessments,
    completedAssessments,
    weightHistory,
    appointmentsInRange,
    allAppointmentsWithSystem,
  ] = await Promise.all([
    prisma.blueprintAssessment.count({ where: { clientId: { not: null }, status: { in: ["BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS"] } } }),
    prisma.blueprintAssessment.count({
      where: { clientId: { not: null }, status: { in: ["BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS"] }, createdAt: { lt: periodStart } },
    }),
    prisma.appointment.count({ where: { status: "COMPLETED", startsAt: { gte: periodStart } } }),
    prisma.appointment.count({ where: { status: "COMPLETED", startsAt: { gte: prevPeriodStart, lt: periodStart } } }),
    prisma.blueprintAssessment.findMany({ where: { clientId: { not: null }, status: { in: ["BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } }, select: { clientId: true, status: true, recommendedSystem: true } }),
    prisma.blueprintAssessment.count({ where: { clientId: { not: null }, status: "COMPLETED" } }),
    prisma.measurement.findMany({ where: { weightKg: { not: null } }, select: { clientId: true, weightKg: true, scanDate: true }, orderBy: { scanDate: "asc" } }),
    prisma.appointment.findMany({ where: { startsAt: { gte: periodStart } }, select: { startsAt: true, status: true, clientId: true } }),
    prisma.appointment.findMany({ where: { status: "COMPLETED" }, include: { client: { include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } } } } }),
  ]);

  function pctDelta(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
  }

  // ---------- Real weight-based improvement tracking (substitute for fabricated "Progress Score"/"Visible Results") ----------
  const weightByClient = new Map<string, { first: number; last: number; firstDate: Date; lastDate: Date }>();
  for (const m of weightHistory) {
    const entry = weightByClient.get(m.clientId);
    if (!entry) {
      weightByClient.set(m.clientId, { first: m.weightKg!, last: m.weightKg!, firstDate: m.scanDate, lastDate: m.scanDate });
    } else {
      entry.last = m.weightKg!;
      entry.lastDate = m.scanDate;
    }
  }
  const clientsWithImprovement = [...weightByClient.values()].filter((w) => w.first - w.last > 0);
  const percentSeeingImprovement = weightByClient.size > 0 ? Math.round((clientsWithImprovement.length / weightByClient.size) * 100) : null;
  const avgWeeksToImprovement =
    clientsWithImprovement.length > 0
      ? Math.round((clientsWithImprovement.reduce((sum, w) => sum + (w.lastDate.getTime() - w.firstDate.getTime()) / (7 * 86400000), 0) / clientsWithImprovement.length) * 10) / 10
      : null;

  const completionPercent =
    activeAssessments.length > 0 ? Math.round((completedAssessments / (activeAssessments.length + completedAssessments)) * 100) : null;

  const transformationSuccessRate = weightByClient.size > 0 ? percentSeeingImprovement : null; // same real signal, distinct KPI label per direction

  // ---------- Progress Over Time chart (real: sessions completed + active clients per bucket) ----------
  const bucketCount = Math.min(days, 60);
  const bucketSizeDays = Math.max(1, Math.round(days / bucketCount));
  const chartDays: { date: string; revenue: number; newClients: number; completedSessions: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(periodStart);
    bucketStart.setDate(bucketStart.getDate() + i * bucketSizeDays);
    chartDays.push({ date: bucketStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: 0, newClients: 0, completedSessions: 0 });
  }
  for (const appt of appointmentsInRange) {
    if (appt.status !== "COMPLETED") continue;
    const idx = Math.min(Math.floor((appt.startsAt.getTime() - periodStart.getTime()) / (bucketSizeDays * 86400000)), bucketCount - 1);
    if (idx >= 0) chartDays[idx].revenue += 1; // reusing GrowthChart's "revenue" line to plot completed-session counts (real, just relabeled)
  }

  // ---------- Progress by System (real: completed session counts per system) ----------
  const sessionsBySystem = new Map<string, number>();
  for (const a of allAppointmentsWithSystem) {
    const sys = a.client.blueprintAssessments[0]?.recommendedSystem || "Custom Systems";
    sessionsBySystem.set(sys, (sessionsBySystem.get(sys) ?? 0) + 1);
  }
  const totalSessionsAllTime = [...sessionsBySystem.values()].reduce((a, b) => a + b, 0);
  const sessionsBySystemSorted = [...sessionsBySystem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  // ---------- Highlight Transformation (real, same logic as Dashboard spotlight) ----------
  const biggestLoss = [...weightByClient.entries()]
    .map(([clientId, w]) => ({ clientId, lossKg: w.first - w.last, ...w }))
    .filter((w) => w.lossKg > 0)
    .sort((a, b) => b.lossKg - a.lossKg)[0];

  let spotlight: { name: string; system: string | null; weeks: number; lossLbs: number; beforeUrl: string | null; afterUrl: string | null; measurements: { label: string; before: number; after: number; unit: string }[] } | null = null;
  if (biggestLoss) {
    const [client, photos, bodyMeasurements] = await Promise.all([
      prisma.client.findUnique({ where: { id: biggestLoss.clientId }, include: { blueprintAssessments: { orderBy: { version: "desc" }, take: 1 } } }),
      prisma.photo.findMany({ where: { clientId: biggestLoss.clientId }, orderBy: { uploadedAt: "asc" } }),
      prisma.bodyMeasurement.findMany({ where: { clientId: biggestLoss.clientId }, orderBy: { measuredAt: "asc" } }),
    ]);
    if (client && photos.length >= 2) {
      const [beforeUrl, afterUrl] = await Promise.all([
        getPhotoSignedUrl(photos[0].storagePath),
        getPhotoSignedUrl(photos[photos.length - 1].storagePath),
      ]);
      const measurements: { label: string; before: number; after: number; unit: string }[] = [];
      if (bodyMeasurements.length >= 2) {
        const first = bodyMeasurements[0];
        const last = bodyMeasurements[bodyMeasurements.length - 1];
        const pairs: [string, "waistCm" | "hipsCm" | "rightThighCm"][] = [
          ["Waist", "waistCm"],
          ["Hips", "hipsCm"],
          ["Thigh", "rightThighCm"],
        ];
        for (const [label, key] of pairs) {
          if (first[key] != null && last[key] != null) {
            measurements.push({ label, before: Math.round(first[key]! / 2.54 * 10) / 10, after: Math.round(last[key]! / 2.54 * 10) / 10, unit: "in" });
          }
        }
      }
      spotlight = {
        name: `${client.firstName} ${client.lastName[0]}.`,
        system: client.blueprintAssessments[0]?.recommendedSystem ?? null,
        weeks: Math.max(1, Math.round((biggestLoss.lastDate.getTime() - biggestLoss.firstDate.getTime()) / (7 * 86400000))),
        lossLbs: Math.round(biggestLoss.lossKg * 2.20462 * 10) / 10,
        beforeUrl,
        afterUrl,
        measurements,
      };
    }
  }

  // ---------- Real insights (no fabricated claims) ----------
  const insights: string[] = [];
  if (sessionsBySystemSorted[0]) insights.push(`${sessionsBySystemSorted[0][0]} clients currently complete the most sessions.`);
  if (avgWeeksToImprovement !== null) insights.push(`Clients seeing measurable weight improvement average ${avgWeeksToImprovement} weeks between their first and most recent scan.`);
  if (percentSeeingImprovement !== null) insights.push(`${percentSeeingImprovement}% of tracked clients show real measurable improvement so far.`);
  if (completionPercent !== null) insights.push(`${completionPercent}% of started Blueprint Assessments™ have reached completion.`);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>progress.</h1>
          <p className="dash-subtitle">Track every client's transformation through measurable results, photos and real progress.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.keys(RANGES).map((r) => (
            <Link key={r} href={`/hub/measurements?range=${r}`} className={`sched-pill ${range === r ? "active" : ""}`}>
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "1 Year"}
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- KPI Row ---------- */}
      <div className="analytics-kpi-grid">
        <div className="pd-stat">
          <span className="pd-stat-label">Clients in Progress</span>
          <strong>{clientsInProgress}</strong>
          {clientsInProgressPrev > 0 && pctDelta(clientsInProgress, clientsInProgressPrev) !== null && (
            <span className={`analytics-delta ${clientsInProgress >= clientsInProgressPrev ? "up" : "down"}`}>
              {clientsInProgress >= clientsInProgressPrev ? "↑" : "↓"} {Math.abs(pctDelta(clientsInProgress, clientsInProgressPrev)!)}% vs prior period
            </span>
          )}
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Sessions Completed</span>
          <strong>{sessionsCompleted}</strong>
          {sessionsCompletedPrev > 0 && pctDelta(sessionsCompleted, sessionsCompletedPrev) !== null && (
            <span className={`analytics-delta ${sessionsCompleted >= sessionsCompletedPrev ? "up" : "down"}`}>
              {sessionsCompleted >= sessionsCompletedPrev ? "↑" : "↓"} {Math.abs(pctDelta(sessionsCompleted, sessionsCompletedPrev)!)}%
            </span>
          )}
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Average Assessment Completion</span>
          <strong>{completionPercent !== null ? `${completionPercent}%` : "—"}</strong>
          <span className="pay-history-meta">Real substitute for "Average Progress Score" — no scoring formula exists</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Clients With Measurable Improvement</span>
          <strong>{percentSeeingImprovement !== null ? `${percentSeeingImprovement}%` : "—"}</strong>
          <span className="pay-history-meta">Real substitute for "Visible Results" — based on real weight tracking</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Transformation Success Rate</span>
          <strong>{transformationSuccessRate !== null ? `${transformationSuccessRate}%` : "—"}</strong>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Avg. Weeks to Measurable Improvement</span>
          <strong>{avgWeeksToImprovement !== null ? `${avgWeeksToImprovement}` : "—"}</strong>
        </div>
      </div>

      <div className="analytics-main-grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        {/* ---------- Progress Over Time ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Progress Over Time</h3>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>Completed sessions per period — real, not a fabricated "Progress Score" trend.</p>
          <GrowthChart data={chartDays} />
        </div>

        {/* ---------- Highlight Transformation ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Highlight Transformation™</h3>
          {spotlight && spotlight.beforeUrl && spotlight.afterUrl ? (
            <>
              <div className="dash-spotlight-photos" style={{ marginBottom: 14 }}>
                <div>
                  <img src={spotlight.beforeUrl} alt="Before" />
                  <span>Before</span>
                </div>
                <div>
                  <img src={spotlight.afterUrl} alt="After" />
                  <span>After</span>
                </div>
              </div>
              <p className="bp-hero-eyebrow">{spotlight.name}</p>
              <p style={{ fontFamily: "var(--serif)", fontSize: 18, margin: "0 0 4px" }}>{spotlight.system ?? "Custom System"}</p>
              <p className="pay-history-meta" style={{ marginBottom: 12 }}>{spotlight.weeks} Weeks</p>
              <div className="dash-spotlight-stat" style={{ marginBottom: 12 }}>
                <strong>-{spotlight.lossLbs} lbs</strong>
                <span>Total Loss</span>
              </div>
              {spotlight.measurements.length > 0 && (
                <div className="cl-summary-list">
                  {spotlight.measurements.map((m) => (
                    <div className="cl-summary-row" key={m.label}>
                      <span>{m.label}</span>
                      <span>
                        {m.before}{m.unit} → {m.after}{m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="dash-empty">No transformation with both before/after photos and weight tracking yet.</p>
          )}
        </div>
      </div>

      <div className="analytics-main-grid" style={{ marginTop: 24 }}>
        {/* ---------- Progress by System ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Progress by System™</h3>
          <RevenueDonut entries={sessionsBySystemSorted} total={totalSessionsAllTime} />
          <p className="pay-history-meta" style={{ marginTop: 12 }}>Share of completed sessions per system (real counts, not revenue).</p>
        </div>

        {/* ---------- Average Completion gauge ---------- */}
        <div className="pd-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16, alignSelf: "flex-start" }}>Average Assessment Completion</h3>
          <div className="cl-ring" style={{ background: `conic-gradient(#5C1A1F ${completionPercent ?? 0}%, rgba(92,26,31,0.15) 0)` }}>
            <div className="cl-ring-inner">
              <strong>{completionPercent !== null ? `${completionPercent}%` : "—"}</strong>
              <span>Complete</span>
            </div>
          </div>
          <p className="pay-history-meta" style={{ marginTop: 12 }}>Based on real Blueprint Assessment™ status.</p>
        </div>

        {/* ---------- Results Visibility ---------- */}
        <div className="pd-card">
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Clients With Measurable Improvement</h3>
          <p style={{ fontFamily: "var(--serif)", fontSize: 42, color: "var(--cat,#5C1A1F)", margin: "8px 0" }}>
            {percentSeeingImprovement !== null ? `${percentSeeingImprovement}%` : "—"}
          </p>
          <p className="pay-history-meta">of tracked clients show real weight improvement, based on RENPHO scan history.</p>
        </div>
      </div>

      {/* ---------- Insights (real, no fabricated claims) ---------- */}
      <h3 className="dash-section-title">Progress Insights</h3>
      {insights.length === 0 ? (
        <p className="dash-empty">Not enough data yet for insights.</p>
      ) : (
        <div className="analytics-metrics-grid">
          {insights.map((text, i) => (
            <div className="bp-stat-card" key={i}>
              <span>Insight {String(i + 1).padStart(2, "0")}</span>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "#2B2622", margin: "4px 0 0" }}>{text}</p>
            </div>
          ))}
        </div>
      )}
      <p className="pay-history-meta" style={{ marginTop: 8 }}>
        "Top Improvements" (Body Contouring, Skin Tightness, etc.) from the mockup isn't shown — there's no per-category
        improvement tracking in the system to back those percentages honestly.
      </p>
    </div>
  );
}
