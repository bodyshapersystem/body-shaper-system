import { prisma } from "@/lib/prisma";
import { computeDailyCompletionPercent } from "@/lib/daily-tracker-scoring";

export type TimelineEvent = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  date: Date;
};

export type MonthlySummary = {
  consistency: number; // avg daily completion % this month
  treatmentsCompleted: number;
  progressDelta: number; // vs. previous month's consistency, in points
};

function dayLabel(date: Date, now: Date): string {
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isToday) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Real Body Response Timeline™ — every entry is derived from actual
 * rows (peptide logs, daily tracker completion swings, completed
 * appointments, real measurement deltas, new photo sessions). Nothing
 * here is fabricated or randomized per client.
 */
export async function getInsights(clientId: string): Promise<{
  summary: MonthlySummary;
  timeline: (TimelineEvent & { dayLabel: string; timeLabel: string })[];
}> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [peptideLogs, trackers, appointmentsThisMonth, completedAppointments, bodyMeasurements, photos] = await Promise.all([
    prisma.peptideLog.findMany({ where: { clientId, administeredAt: { gte: ninetyDaysAgo } }, orderBy: { administeredAt: "desc" } }),
    prisma.dailyTracker.findMany({ where: { clientId, date: { gte: prevMonthStart } }, orderBy: { date: "asc" } }),
    prisma.appointment.count({ where: { clientId, status: "COMPLETED", startsAt: { gte: monthStart } } }),
    prisma.appointment.findMany({ where: { clientId, status: "COMPLETED", startsAt: { gte: ninetyDaysAgo } }, orderBy: { startsAt: "desc" } }),
    prisma.bodyMeasurement.findMany({ where: { clientId }, orderBy: { measuredAt: "asc" } }),
    prisma.photo.findMany({ where: { clientId, visibility: "CLIENT_VISIBLE" }, orderBy: { uploadedAt: "asc" }, select: { uploadedAt: true, sessionNumber: true } }),
  ]);

  // --- Monthly summary ---
  const thisMonthTrackers = trackers.filter((t) => t.date >= monthStart);
  const prevMonthTrackers = trackers.filter((t) => t.date >= prevMonthStart && t.date < monthStart);

  function avgCompletion(rows: typeof trackers): number {
    if (rows.length === 0) return 0;
    const scores = rows.map((t) =>
      computeDailyCompletionPercent({
        date: t.date.toISOString(),
        waterGlasses: t.waterGlasses,
        steps: t.steps,
        sleepHours: t.sleepHours,
        compressionWorn: t.compressionWorn,
        moodCheckIn: t.moodCheckIn,
        symptoms: t.symptoms,
        weightLbs: t.weightLbs,
      })
    );
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  const consistency = avgCompletion(thisMonthTrackers);
  const prevConsistency = avgCompletion(prevMonthTrackers);
  const progressDelta = prevMonthTrackers.length > 0 ? consistency - prevConsistency : 0;

  // --- Timeline events ---
  const events: TimelineEvent[] = [];

  for (const log of peptideLogs.slice(0, 10)) {
    events.push({
      id: `pep-${log.id}`,
      icon: "syringe",
      title: "Peptide injection logged",
      detail: `${log.peptideName}${log.dosage ? ` ${log.dosage}` : ""}`,
      date: log.administeredAt,
    });
  }

  for (const appt of completedAppointments.slice(0, 10)) {
    events.push({ id: `appt-${appt.id}`, icon: "session", title: `${appt.title} completed`, detail: "Session logged", date: appt.startsAt });
  }

  // Daily completion swings — hydration goal met, and meaningful day-over-day score jumps.
  for (let i = 1; i < trackers.length; i++) {
    const prev = trackers[i - 1];
    const curr = trackers[i];
    if (curr.waterGlasses >= 8 && prev.waterGlasses < 8) {
      events.push({ id: `hyd-${curr.id}`, icon: "hydration", title: "Hydration up", detail: "8 glasses goal met", date: curr.date });
    }
    if (curr.symptoms.length === 0 && prev.symptoms.length > 0) {
      events.push({ id: `sym-${curr.id}`, icon: "symptom", title: "Symptoms improved", detail: "Feeling lighter", date: curr.date });
    }
    const prevScore = computeDailyCompletionPercent({
      date: prev.date.toISOString(), waterGlasses: prev.waterGlasses, steps: prev.steps, sleepHours: prev.sleepHours,
      compressionWorn: prev.compressionWorn, moodCheckIn: prev.moodCheckIn, symptoms: prev.symptoms, weightLbs: prev.weightLbs,
    });
    const currScore = computeDailyCompletionPercent({
      date: curr.date.toISOString(), waterGlasses: curr.waterGlasses, steps: curr.steps, sleepHours: curr.sleepHours,
      compressionWorn: curr.compressionWorn, moodCheckIn: curr.moodCheckIn, symptoms: curr.symptoms, weightLbs: curr.weightLbs,
    });
    if (currScore - prevScore >= 15) {
      events.push({ id: `score-${curr.id}`, icon: "score", title: "Recovery score improved", detail: `From ${prevScore}% to ${currScore}%`, date: curr.date });
    }
  }

  // Real measurement deltas, comparing each consecutive session.
  const fields = ["waistCm", "hipsCm", "chestCm"] as const;
  for (let i = 1; i < bodyMeasurements.length; i++) {
    const prev = bodyMeasurements[i - 1];
    const curr = bodyMeasurements[i];
    for (const f of fields) {
      const p = prev[f];
      const c = curr[f];
      if (p != null && c != null && p !== c) {
        const diff = c - p;
        const label = f === "waistCm" ? "Waist" : f === "hipsCm" ? "Hips" : "Chest";
        events.push({
          id: `meas-${curr.id}-${f}`,
          icon: "measurement",
          title: `${label} measurement`,
          detail: `${diff > 0 ? "+" : ""}${(diff / 2.54).toFixed(1)} in`,
          date: curr.measuredAt,
        });
        break; // one measurement highlight per session, not every field
      }
    }
  }

  // New progress photo sessions.
  const seenSessions = new Set<number>();
  for (const p of photos) {
    if (p.sessionNumber != null && !seenSessions.has(p.sessionNumber)) {
      seenSessions.add(p.sessionNumber);
      events.push({ id: `photo-${p.sessionNumber}`, icon: "photo", title: "Progress photo added", detail: `Session ${p.sessionNumber}`, date: p.uploadedAt });
    }
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  const timeline = events.slice(0, 20).map((e) => ({
    ...e,
    dayLabel: dayLabel(e.date, now),
    timeLabel: e.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  }));

  return {
    summary: { consistency, treatmentsCompleted: appointmentsThisMonth, progressDelta },
    timeline,
  };
}
