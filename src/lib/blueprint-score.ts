import { prisma } from "@/lib/prisma";

/**
 * Blueprint Score™ — a real, transparent 0-100 score computed from
 * actual client data, not a fabricated number. Three components:
 *
 * 1. Session Adherence (0-40 pts): how much of the validated session
 *    plan has actually been completed. Neutral 20 if no session
 *    count has been set yet.
 * 2. Attendance Reliability (0-20 pts): completed vs no-show rate.
 *    Full 20 if there are no no-shows on record (including zero
 *    appointments at all — nothing to penalize yet).
 * 3. Body Composition Trend (0-40 pts): compares the client's
 *    earliest and latest RENPHO scan's body fat % — real improvement
 *    raises the score, real decline lowers it. Neutral 20 if there's
 *    only one scan (or none) to compare, since a trend needs two
 *    points.
 *
 * Every component is independently computed from real rows — nothing
 * here is randomized or hardcoded per client.
 */
export async function computeBlueprintScore(clientId: string): Promise<{
  score: number;
  components: { sessionAdherence: number; attendanceReliability: number; compositionTrend: number };
} | null> {
  const [assessment, completedCount, noShowCount, scans] = await Promise.all([
    prisma.blueprintAssessment.findFirst({
      where: { clientId, status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: { version: "desc" },
    }),
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { clientId, status: "NO_SHOW" } }),
    prisma.measurement.findMany({
      where: { clientId, bodyFatPercent: { not: null } },
      orderBy: { scanDate: "asc" },
      select: { bodyFatPercent: true, scanDate: true },
    }),
  ]);

  if (!assessment) return null;

  const totalSessions = assessment.validatedSessionCount;
  const priorCredit = assessment.priorCompletedSessions ?? 0;
  const realCompleted = completedCount + priorCredit;

  const sessionAdherence = totalSessions && totalSessions > 0 ? Math.min(realCompleted / totalSessions, 1) * 40 : 20;

  const totalAttended = completedCount + noShowCount;
  const attendanceReliability = totalAttended > 0 ? (completedCount / totalAttended) * 20 : 20;

  let compositionTrend = 20;
  if (scans.length >= 2) {
    const first = scans[0].bodyFatPercent!;
    const latest = scans[scans.length - 1].bodyFatPercent!;
    const delta = latest - first; // negative = improvement (lower body fat)
    compositionTrend = Math.max(0, Math.min(40, 20 - delta * 4));
  }

  const score = Math.round(sessionAdherence + attendanceReliability + compositionTrend);

  return {
    score,
    components: {
      sessionAdherence: Math.round(sessionAdherence),
      attendanceReliability: Math.round(attendanceReliability),
      compositionTrend: Math.round(compositionTrend),
    },
  };
}
