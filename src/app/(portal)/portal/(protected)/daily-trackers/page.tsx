import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { computeStreak, type TrackerDay } from "@/lib/daily-tracker-scoring";
import { computeNextInjection } from "@/lib/peptide-schedule";
import { getBusinessTimezone, getBusinessTodayUtc } from "@/lib/format-datetime";
import TodayView, { type UpNextItem } from "./TodayView";

export const dynamic = "force-dynamic";

export default async function DailyTrackersPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const timezone = await getBusinessTimezone();
  const today = getBusinessTodayUtc(timezone);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const recentTrackers = await prisma.dailyTracker.findMany({
    where: { clientId: client.id, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const todayIso = today.toISOString();
  const todayTracker = recentTrackers.find((t) => t.date.toISOString() === todayIso) ?? null;

  const days: TrackerDay[] = recentTrackers.map((t) => ({
    date: t.date.toISOString(),
    waterGlasses: t.waterGlasses,
    steps: t.steps,
    sleepHours: t.sleepHours,
    compressionWorn: t.compressionWorn,
    moodCheckIn: t.moodCheckIn,
    symptoms: t.symptoms,
    weightLbs: t.weightLbs,
  }));

  const streak = computeStreak(days);

  // Real "Up Next" — sourced from active peptide protocols for now
  // (Reminder Center will expand this to hydration/compression/etc.
  // once built). Only shown if something is genuinely within the
  // next 12 hours, never a stale or far-off item.
  const activeProtocols = await prisma.peptideProtocol.findMany({ where: { clientId: client.id, active: true } });
  const now = new Date();
  const twelveHoursOut = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const upNext: UpNextItem[] = activeProtocols
    .map((p) => ({ p, next: computeNextInjection(p.frequency, p.injectionDays, p.injectionTime, now) }))
    .filter(({ next }) => next <= twelveHoursOut)
    .sort((a, b) => a.next.getTime() - b.next.getTime())
    .slice(0, 3)
    .map(({ p, next }) => ({
      label: `${p.peptideName} injection`,
      timeLabel: `${next.toLocaleDateString("en-US", { weekday: "short" })} ${next.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
    }));

  return (
    <div className="cat-body portal-page dtj-page-wrap">
      <TodayView
        firstName={client.firstName}
        todayTracker={
          todayTracker
            ? {
                waterGlasses: todayTracker.waterGlasses,
                steps: todayTracker.steps,
                stepsGoal: todayTracker.stepsGoal,
                sleepHours: todayTracker.sleepHours,
                sleepQuality: todayTracker.sleepQuality,
                compressionWorn: todayTracker.compressionWorn,
                compressionHours: todayTracker.compressionHours,
                moodCheckIn: todayTracker.moodCheckIn,
                moodNote: todayTracker.moodNote,
                symptoms: todayTracker.symptoms,
                dailyNote: todayTracker.dailyNote,
                weightLbs: todayTracker.weightLbs,
              }
            : null
        }
        days={days}
        streak={streak}
        upNext={upNext}
      />
    </div>
  );
}
