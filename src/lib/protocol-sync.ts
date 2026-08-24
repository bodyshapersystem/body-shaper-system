import { prisma } from "@/lib/prisma";
import { getBusinessTimezone, getBusinessTodayUtc } from "@/lib/format-datetime";

const DAY_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type WeekTask = {
  id: string;
  label: string;
  detail: string; // e.g. "Mon · 8:00 AM" or "8 Glasses"
  status: "complete" | "pending" | "skipped";
  icon: string;
};

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day); // back up to Sunday
  return d;
}

/**
 * Real weekly task list — every row is derived from actual data
 * (protocol schedule, real appointments, today's Daily Tracker row),
 * nothing hardcoded. consistencyScore is simply completed/total for
 * this week's items, matching the mockup's "consistency score".
 */
export async function getWeekSync(clientId: string): Promise<{
  tasks: WeekTask[];
  consistencyScore: number;
  weekDays: { label: string; dateNum: number; isToday: boolean }[];
}> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const timezone = await getBusinessTimezone();
  const todayStart = getBusinessTodayUtc(timezone);

  const [protocols, peptideLogs, appointments, todayTracker] = await Promise.all([
    prisma.peptideProtocol.findMany({ where: { clientId, active: true } }),
    prisma.peptideLog.findMany({ where: { clientId, administeredAt: { gte: weekStart, lt: weekEnd } } }),
    prisma.appointment.findMany({ where: { clientId, startsAt: { gte: weekStart, lt: weekEnd } }, orderBy: { startsAt: "asc" } }),
    prisma.dailyTracker.findFirst({ where: { clientId, date: todayStart } }),
  ]);

  const tasks: WeekTask[] = [];

  // Peptide injection occurrences this week, across every active
  // protocol — a client doing 2-3 peptides together gets each one's
  // schedule represented, not just a single protocol's.
  for (const protocol of protocols) {
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayCode = DAY_ORDER[day.getDay()];
      const isScheduledDay = protocol.frequency === "Daily" || protocol.injectionDays.includes(dayCode);
      if (!isScheduledDay) continue;

      const [h, m] = protocol.injectionTime.split(":").map(Number);
      const scheduledAt = new Date(day);
      scheduledAt.setHours(h, m, 0, 0);

      const loggedThatDay = peptideLogs.some((l) => l.peptideName === protocol.peptideName && l.administeredAt.toDateString() === day.toDateString());
      const status: WeekTask["status"] = loggedThatDay ? "complete" : scheduledAt < now ? "skipped" : "pending";

      tasks.push({
        id: `peptide-${protocol.id}-${i}`,
        label: `${protocol.peptideName} Injection`,
        detail: `${day.toLocaleDateString("en-US", { weekday: "short" })} · ${scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        status,
        icon: "💉",
      });
    }
  }

  // Real appointments this week.
  for (const appt of appointments) {
    const status: WeekTask["status"] = appt.status === "COMPLETED" ? "complete" : appt.status === "NO_SHOW" || appt.status === "CANCELLED" ? "skipped" : "pending";
    tasks.push({
      id: `appt-${appt.id}`,
      label: appt.title,
      detail: `${appt.startsAt.toLocaleDateString("en-US", { weekday: "short" })} · ${appt.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      status,
      icon: "✧",
    });
  }

  // Today's Daily Tracker goals.
  const water = todayTracker?.waterGlasses ?? 0;
  const steps = todayTracker?.steps ?? 0;
  const stepsGoal = todayTracker?.stepsGoal ?? 8000;
  const sleepHours = todayTracker?.sleepHours ?? null;
  const compressionWorn = todayTracker?.compressionWorn ?? null;

  tasks.push({ id: "hydration", label: "Hydration Goal", detail: "8 Glasses", status: water >= 8 ? "complete" : "pending", icon: "💧" });
  tasks.push({ id: "movement", label: "Movement Goal", detail: `${stepsGoal.toLocaleString()} Steps`, status: steps >= stepsGoal ? "complete" : "pending", icon: "👟" });
  tasks.push({ id: "sleep", label: "Sleep Goal", detail: "7+ Hours", status: (sleepHours ?? 0) >= 7 ? "complete" : "pending", icon: "🌙" });
  if (compressionWorn !== null) {
    tasks.push({ id: "compression", label: "Compression Goal", detail: "Worn today", status: compressionWorn ? "complete" : "pending", icon: "🎽" });
  }

  const completedCount = tasks.filter((t) => t.status === "complete").length;
  const consistencyScore = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { label: d.toLocaleDateString("en-US", { weekday: "narrow" }), dateNum: d.getDate(), isToday: d.toDateString() === now.toDateString() };
  });

  return { tasks, consistencyScore, weekDays };
}
