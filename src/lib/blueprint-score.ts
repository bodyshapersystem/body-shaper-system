import { prisma } from "@/lib/prisma";

/**
 * Blueprint Score™ — a real, transparent 0-100 score computed from
 * actual client data, not a fabricated number. Five components:
 *
 * 1. Session Adherence (0-25 pts): how much of the validated session
 *    plan has actually been completed. Neutral half-credit if no
 *    session count has been set yet.
 * 2. Attendance Reliability (0-15 pts): completed vs no-show rate.
 *    Full credit if there are no no-shows on record (including zero
 *    appointments at all — nothing to penalize yet).
 * 3. Body Composition Trend / RENPHO (0-25 pts): compares the
 *    client's earliest and latest RENPHO scan's body fat % — real
 *    improvement raises the score, real decline lowers it. Neutral
 *    half-credit if there's only one scan (or none) to compare.
 * 4. Body Measurements Trend (0-20 pts): compares the earliest and
 *    latest professional measurement session (waist/hips/bust/thighs/
 *    arms — averaged across whichever fields exist on both), same
 *    logic as #3. Neutral half-credit with fewer than two sessions.
 * 5. Progress Photo Consistency (0-15 pts): real progress photos are
 *    tracked in full sessions of 4 (front/left/right/back) - this
 *    rewards actually having multiple complete before/after sessions
 *    on file, not just appointments attended. Full credit at 2+
 *    complete sessions, half at 1, none at 0.
 *
 * Every component is independently computed from real rows — nothing
 * here is randomized or hardcoded per client.
 */
export async function computeBlueprintScore(clientId: string): Promise<{
  score: number;
  components: {
    sessionAdherence: number;
    attendanceReliability: number;
    compositionTrend: number;
    measurementsTrend: number;
    photoConsistency: number;
  };
} | null> {
  const [assessment, completedCount, noShowCount, scans, bodyMeasurements, photoCount] = await Promise.all([
    prisma.blueprintAssessment.findFirst({
      where: { clientId, status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: { version: "desc" },
    }),
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { clientId, status: "NO_SHOW" } }),
    prisma.measurement.findMany({
      where: { clientId, bodyFatPercent: { not: null } },
      orderBy: { scanDate: "asc" },
      select: { bodyFatPercent: true },
    }),
    prisma.bodyMeasurement.findMany({
      where: { clientId },
      orderBy: { measuredAt: "asc" },
      select: { waistCm: true, hipsCm: true, chestCm: true, rightThighCm: true, leftThighCm: true, rightArmCm: true, leftArmCm: true },
    }),
    prisma.photo.count({ where: { clientId, visibility: "CLIENT_VISIBLE" } }),
  ]);

  if (!assessment) return null;

  const totalSessions = assessment.validatedSessionCount;
  const priorCredit = assessment.priorCompletedSessions ?? 0;
  const realCompleted = completedCount + priorCredit;

  const sessionAdherence = totalSessions && totalSessions > 0 ? Math.min(realCompleted / totalSessions, 1) * 25 : 12.5;

  const totalAttended = completedCount + noShowCount;
  const attendanceReliability = totalAttended > 0 ? (completedCount / totalAttended) * 15 : 15;

  let compositionTrend = 12.5;
  if (scans.length >= 2) {
    const first = scans[0].bodyFatPercent!;
    const latest = scans[scans.length - 1].bodyFatPercent!;
    const delta = latest - first; // negative = improvement (lower body fat)
    compositionTrend = Math.max(0, Math.min(25, 12.5 - delta * 2.5));
  }

  let measurementsTrend = 10;
  if (bodyMeasurements.length >= 2) {
    const first = bodyMeasurements[0];
    const latest = bodyMeasurements[bodyMeasurements.length - 1];
    const fields = ["waistCm", "hipsCm", "chestCm", "rightThighCm", "leftThighCm", "rightArmCm", "leftArmCm"] as const;
    const pctChanges: number[] = [];
    for (const f of fields) {
      const firstVal = first[f];
      const latestVal = latest[f];
      if (firstVal != null && latestVal != null && firstVal > 0) {
        pctChanges.push(((latestVal - firstVal) / firstVal) * 100);
      }
    }
    if (pctChanges.length > 0) {
      const avgPctChange = pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length;
      // Negative avg % change (measurements shrinking) = improvement for body contouring goals.
      measurementsTrend = Math.max(0, Math.min(20, 10 - avgPctChange * 4));
    }
  }

  const completePhotoSessions = Math.floor(photoCount / 4);
  const photoConsistency = (Math.min(completePhotoSessions, 2) / 2) * 15;

  const score = Math.round(sessionAdherence + attendanceReliability + compositionTrend + measurementsTrend + photoConsistency);

  return {
    score,
    components: {
      sessionAdherence: Math.round(sessionAdherence),
      attendanceReliability: Math.round(attendanceReliability),
      compositionTrend: Math.round(compositionTrend),
      measurementsTrend: Math.round(measurementsTrend),
      photoConsistency: Math.round(photoConsistency),
    },
  };
}
