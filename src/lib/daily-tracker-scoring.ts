export type TrackerDay = {
  date: string; // ISO date (midnight)
  waterGlasses: number;
  steps: number | null;
  sleepHours: number | null;
  compressionWorn: boolean | null;
  moodCheckIn: string | null;
  symptoms: string[];
  weightLbs: number | null;
};

const CATEGORIES = ["hydration", "movement", "sleep", "compression", "nutrition", "symptoms", "weight"] as const;

/**
 * Real per-day completion check across the 7 categories in the
 * design spec. This IS the Recovery Score™ input — an adherence
 * score, not a medical score, per direction.
 */
export function getCompletedCategories(day: TrackerDay): Record<(typeof CATEGORIES)[number], boolean> {
  return {
    hydration: day.waterGlasses > 0,
    movement: (day.steps ?? 0) > 0,
    sleep: day.sleepHours !== null,
    compression: day.compressionWorn !== null,
    nutrition: day.moodCheckIn !== null,
    symptoms: day.symptoms.length > 0,
    weight: day.weightLbs !== null,
  };
}

export function computeDailyCompletionPercent(day: TrackerDay): number {
  const completed = getCompletedCategories(day);
  const done = Object.values(completed).filter(Boolean).length;
  return Math.round((done / CATEGORIES.length) * 100);
}

/** Recovery Score™ is the same adherence calculation, per direction — presented separately with its own label/explanation. */
export const computeRecoveryScore = computeDailyCompletionPercent;

/** Real streak: consecutive days (ending today or yesterday) with any tracker activity logged at all. */
export function computeStreak(days: TrackerDay[]): number {
  const byDate = new Map(days.map((d) => [d.date.slice(0, 10), d]));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Allow the streak to still count if today isn't logged yet, starting from yesterday.
  if (!byDate.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const day = byDate.get(key);
    if (!day) break;
    const completed = getCompletedCategories(day);
    if (!Object.values(completed).some(Boolean)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type Achievement = { icon: string; label: string; earned: boolean };

export function computeAchievements(days: TrackerDay[], streak: number): Achievement[] {
  const hydratedDays = days.filter((d) => d.waterGlasses >= 8).length;
  const daysWithAnyActivity = days.filter((d) => Object.values(getCompletedCategories(d)).some(Boolean)).length;

  return [
    { icon: "💧", label: "7 Days Hydrated", earned: hydratedDays >= 7 },
    { icon: "🔥", label: "7-Day Streak", earned: streak >= 7 },
    { icon: "📅", label: "First Week Complete", earned: daysWithAnyActivity >= 7 },
    { icon: "✨", label: "Blueprint Consistency", earned: days.filter((d) => computeDailyCompletionPercent(d) >= 80).length >= 5 },
  ];
}
