import { prisma } from "@/lib/prisma";
import { signNudgeAction } from "@/lib/nudge-action-token";

const CONFIRM_BASE_URL = "https://www.bodyshapersystem.com/nudge-confirm";

function isWithinQuietHours(nowLocal: Date, quietStart: string | null, quietEnd: string | null): boolean {
  if (!quietStart || !quietEnd) return false;
  const [sh, sm] = quietStart.split(":").map(Number);
  const [eh, em] = quietEnd.split(":").map(Number);
  const nowMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes();
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function isTimeDueThisHour(reminderTime: string, nowLocal: Date): boolean {
  const [h] = reminderTime.split(":").map(Number);
  return h === nowLocal.getHours();
}

function todayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function alreadySent(clientId: string, category: string, scheduledTime: string): Promise<boolean> {
  const existing = await prisma.nudgeLog.findUnique({
    where: { clientId_category_scheduledDate_scheduledTime: { clientId, category, scheduledDate: todayUtc(), scheduledTime } },
  });
  return !!existing;
}

async function recordSent(clientId: string, category: string, scheduledTime: string) {
  await prisma.nudgeLog.create({ data: { clientId, category, scheduledDate: todayUtc(), scheduledTime } });
}

export type NudgeToSend =
  | { category: "HYDRATION"; clientId: string; email: string; firstName: string; current: number; goal: number; scheduledTime: string; confirmUrl: string }
  | { category: "PROTEIN"; clientId: string; email: string; firstName: string; current: number | null; goal: number | null; scheduledTime: string; confirmUrl: string }
  | { category: "COMPRESSION"; clientId: string; email: string; firstName: string; currentHours: number; goalHours: number; scheduledTime: string; confirmUrl: string }
  | { category: "MOVEMENT"; clientId: string; email: string; firstName: string; current: number; goal: number; scheduledTime: string }
  | { category: "SLEEP"; clientId: string; email: string; firstName: string; scheduledTime: string }
  | { category: "PEPTIDE_UPCOMING"; clientId: string; email: string; firstName: string; peptideName: string; scheduledAt: Date; hoursBefore: number }
  | { category: "PEPTIDE_OVERDUE"; clientId: string; email: string; firstName: string; peptideName: string; scheduledAt: Date }
  | { category: "APPOINTMENT"; clientId: string; email: string; firstName: string; title: string; startsAt: Date }
  | { category: "WEEKLY_CHECKIN"; clientId: string; email: string; firstName: string; outstanding: string[] };

/**
 * Real, event-driven nudge computation — runs hourly. For each
 * category: checks the client's own ReminderPreference (enabled +
 * email + reminder times + relevant days), quiet hours, whether
 * today's goal is already met (suppresses the send entirely), and
 * whether this exact slot was already sent today (NudgeLog).
 * Nothing here is a blanket blast to every client.
 */
export async function computeDueNudges(): Promise<NudgeToSend[]> {
  const now = new Date();
  const dayCode = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()];
  const todayStart = todayUtc();

  const clients = await prisma.client.findMany({
    where: { user: { portalStatus: "ACTIVE" } },
    include: {
      reminderPreferences: true,
      dailyTrackers: { where: { date: todayStart }, take: 1 },
      peptideProtocols: { where: { active: true } },
      peptideLogs: { where: { administeredAt: { gte: todayStart } } },
    },
  });

  const due: NudgeToSend[] = [];

  for (const client of clients) {
    const prefByCategory = new Map(client.reminderPreferences.map((p) => [p.category, p]));
    const today = client.dailyTrackers[0];
    const quietNow = isWithinQuietHours(now, client.quietHoursStart, client.quietHoursEnd);

    const hydrationPref = prefByCategory.get("HYDRATION");
    if (hydrationPref?.enabled && hydrationPref.emailEnabled && !quietNow) {
      const current = today?.waterGlasses ?? 0;
      const goalComplete = current >= client.hydrationGoalGlasses;
      if (!goalComplete) {
        for (const t of hydrationPref.reminderTimes) {
          if (isTimeDueThisHour(t, now) && !(await alreadySent(client.id, "HYDRATION", t))) {
            due.push({
              category: "HYDRATION", clientId: client.id, email: client.email, firstName: client.firstName, current, goal: client.hydrationGoalGlasses, scheduledTime: t,
              confirmUrl: `${CONFIRM_BASE_URL}?token=${signNudgeAction(client.id, "HYDRATION", now)}`,
            });
            await recordSent(client.id, "HYDRATION", t);
          }
        }
      }
    }

    const proteinPref = prefByCategory.get("PROTEIN");
    if (proteinPref?.enabled && proteinPref.emailEnabled && !quietNow) {
      const current = today?.proteinGrams ?? null;
      const goal = client.proteinGoalGrams;
      const goalComplete = goal != null && current != null && current >= goal;
      if (!goalComplete) {
        for (const t of proteinPref.reminderTimes) {
          if (isTimeDueThisHour(t, now) && !(await alreadySent(client.id, "PROTEIN", t))) {
            due.push({
              category: "PROTEIN", clientId: client.id, email: client.email, firstName: client.firstName, current, goal, scheduledTime: t,
              confirmUrl: `${CONFIRM_BASE_URL}?token=${signNudgeAction(client.id, "PROTEIN", now)}`,
            });
            await recordSent(client.id, "PROTEIN", t);
          }
        }
      }
    }

    const compressionPref = prefByCategory.get("COMPRESSION");
    if (compressionPref?.enabled && compressionPref.emailEnabled && !quietNow && client.compressionHoursRequired) {
      const inDateRange =
        (!client.compressionProtocolStartDate || now >= client.compressionProtocolStartDate) &&
        (!client.compressionProtocolEndDate || now <= client.compressionProtocolEndDate);
      const isProtocolDay = client.compressionDays.length === 0 || client.compressionDays.includes(dayCode);
      const relevantToday = compressionPref.relevantDays.length === 0 || compressionPref.relevantDays.includes(dayCode);
      if (inDateRange && isProtocolDay && relevantToday) {
        const currentHours = today?.compressionHours ?? 0;
        const goalComplete = currentHours >= client.compressionHoursRequired;
        if (!goalComplete) {
          for (const t of compressionPref.reminderTimes) {
            if (isTimeDueThisHour(t, now) && !(await alreadySent(client.id, "COMPRESSION", t))) {
              due.push({
                category: "COMPRESSION", clientId: client.id, email: client.email, firstName: client.firstName, currentHours, goalHours: client.compressionHoursRequired, scheduledTime: t,
                confirmUrl: `${CONFIRM_BASE_URL}?token=${signNudgeAction(client.id, "COMPRESSION", now)}`,
              });
              await recordSent(client.id, "COMPRESSION", t);
            }
          }
        }
      }
    }

    const movementPref = prefByCategory.get("MOVEMENT");
    if (movementPref?.enabled && movementPref.emailEnabled && !quietNow) {
      const current = today?.steps ?? 0;
      const goalComplete = current >= client.movementGoalSteps;
      if (!goalComplete) {
        for (const t of movementPref.reminderTimes) {
          if (isTimeDueThisHour(t, now) && !(await alreadySent(client.id, "MOVEMENT", t))) {
            due.push({ category: "MOVEMENT", clientId: client.id, email: client.email, firstName: client.firstName, current, goal: client.movementGoalSteps, scheduledTime: t });
            await recordSent(client.id, "MOVEMENT", t);
          }
        }
      }
    }

    const sleepPref = prefByCategory.get("SLEEP");
    if (sleepPref?.enabled && sleepPref.emailEnabled && !quietNow) {
      for (const t of sleepPref.reminderTimes) {
        if (isTimeDueThisHour(t, now) && !(await alreadySent(client.id, "SLEEP", t))) {
          due.push({ category: "SLEEP", clientId: client.id, email: client.email, firstName: client.firstName, scheduledTime: t });
          await recordSent(client.id, "SLEEP", t);
        }
      }
    }

    const peptidePref = prefByCategory.get("PEPTIDE");
    if (peptidePref?.enabled && peptidePref.emailEnabled) {
      for (const protocol of client.peptideProtocols) {
        if (!protocol.reminderEnabled) continue;
        const [h, m] = protocol.injectionTime.split(":").map(Number);
        const scheduledToday = new Date(now);
        scheduledToday.setHours(h, m, 0, 0);
        const isScheduledDay = protocol.frequency === "Daily" || protocol.injectionDays.includes(dayCode);
        if (!isScheduledDay) continue;

        const alreadyLogged = client.peptideLogs.some((l) => l.peptideName === protocol.peptideName);
        if (alreadyLogged) continue;

        const hoursUntil = (scheduledToday.getTime() - now.getTime()) / (1000 * 60 * 60);
        const slotKey = `${protocol.id}`;

        if (hoursUntil > 0 && hoursUntil <= 1 && !quietNow) {
          if (!(await alreadySent(client.id, "PEPTIDE_UPCOMING", slotKey))) {
            due.push({ category: "PEPTIDE_UPCOMING", clientId: client.id, email: client.email, firstName: client.firstName, peptideName: protocol.peptideName, scheduledAt: scheduledToday, hoursBefore: 1 });
            await recordSent(client.id, "PEPTIDE_UPCOMING", slotKey);
          }
        } else if (hoursUntil <= 0 && hoursUntil > -3 && !quietNow) {
          if (!(await alreadySent(client.id, "PEPTIDE_OVERDUE", slotKey))) {
            due.push({ category: "PEPTIDE_OVERDUE", clientId: client.id, email: client.email, firstName: client.firstName, peptideName: protocol.peptideName, scheduledAt: scheduledToday });
            await recordSent(client.id, "PEPTIDE_OVERDUE", slotKey);
          }
        }
      }
    }

    const apptPref = prefByCategory.get("APPOINTMENTS");
    if (apptPref?.enabled && apptPref.emailEnabled && !quietNow && now.getHours() === 9) {
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      const appt = await prisma.appointment.findFirst({
        where: { clientId: client.id, startsAt: { gte: tomorrowStart, lt: tomorrowEnd }, status: "SCHEDULED" },
      });
      if (appt && !(await alreadySent(client.id, "APPOINTMENT", appt.id))) {
        due.push({ category: "APPOINTMENT", clientId: client.id, email: client.email, firstName: client.firstName, title: appt.title, startsAt: appt.startsAt });
        await recordSent(client.id, "APPOINTMENT", appt.id);
      }
    }

    const weeklyPref = prefByCategory.get("WEEKLY_CHECKIN");
    if (weeklyPref?.enabled && weeklyPref.emailEnabled && !quietNow && dayCode === "SUN" && now.getHours() === 9) {
      const outstanding: string[] = [];
      if ((today?.waterGlasses ?? 0) < client.hydrationGoalGlasses) outstanding.push("Hydration");
      if (client.proteinGoalGrams && (today?.proteinGrams ?? 0) < client.proteinGoalGrams) outstanding.push("Protein");
      if ((today?.steps ?? 0) < client.movementGoalSteps) outstanding.push("Movement");
      if (today?.sleepHours == null) outstanding.push("Sleep");
      if (!today?.moodCheckIn) outstanding.push("Mood");
      if (outstanding.length > 0 && !(await alreadySent(client.id, "WEEKLY_CHECKIN", ""))) {
        due.push({ category: "WEEKLY_CHECKIN", clientId: client.id, email: client.email, firstName: client.firstName, outstanding });
        await recordSent(client.id, "WEEKLY_CHECKIN", "");
      }
    }
  }

  return due;
}
