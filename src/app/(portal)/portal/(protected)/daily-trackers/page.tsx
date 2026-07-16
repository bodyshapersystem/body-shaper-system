import { redirect } from "next/navigation";
import { getCurrentPortalClient } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { computeStreak, computeAchievements, type TrackerDay } from "@/lib/daily-tracker-scoring";
import TrackersView from "./TrackersView";

export const dynamic = "force-dynamic";

function todayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function DailyTrackersPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const recentTrackers = await prisma.dailyTracker.findMany({
    where: { clientId: client.id, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const today = todayUtc();
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
  const achievements = computeAchievements(days, streak);

  const weightHistory = recentTrackers
    .filter((t) => t.weightLbs !== null)
    .map((t) => ({ date: t.date.toISOString(), weightLbs: t.weightLbs as number }))
    .reverse();

  return (
    <div className="cat-body portal-page">
      <TrackersView
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
        achievements={achievements}
        weightHistory={weightHistory}
      />
    </div>
  );
}
